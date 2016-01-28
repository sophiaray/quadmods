// Basic inputs

conditions = ["baseline", "active", "responsive"]
shapes = ["square", "rectangle", "rhombus", "parallelogram"];

exp = {
  num_examples_to_show: 3,
  num_examples_clicked: 0,
  instruction_wait_time: 3, //in seconds
}

// urls are of the form: https://website.com/?shape=0&condition=0&assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE

// the shape parameter is either 0,1,2,3, or r for the items in the `shapes` list or random
// the condition parameter is either 0,1,2, or r for items in the `conditions` list or random

//set parameters based on url
url = $.url()
shape_param = url.attr('shape'); cond_param = url.attr('condition')
exp.shape =  shape_param == 'r' ? _.sample(shapes) : shapes[shape_param]
exp.condition =  cond_param == 'r' ? _.sample(conditions) : conditions[shape_param]


// now build some useful data

pluralize_shapes = {"square":"squares", "rectangle":"rectangles", "rhombus":"rhombuses", "parallelogram":"parallelograms"};
subset_shapes = { 
  "parallelogram": ["square", "rhombus", "rectangle", "parallelogram"],
  "rectangle": ["square","rectangle"],
  "rhombus": ["square", "rhombus"],
  "square": ["square"]
}
shape_pairs = []
for (shape1 of shapes) {
  for (shape2 of shapes) {
    if (shape1 != shape2){
      shape_pairs.push([shape1, shape2])
    }
  }
}

// each of these should have a div in the html file
// here, we pair each slide with a constructor and check function


// SLIDES
// the way slides are going to work is that each slide will have a constructor that uses jquery to build it out of html and a destructor that runs after the constructor, sets the conditions for either destruction or the creation of a "next" button, and determines what goes into that button.

// the slide array is a stack. next_slide pops off the top and executes a constructor and destructor. the order the slides should be in might seem opposite of what's expected. like [last_slide, ..., second_slide, first_slide]
slides= [
  { name: "final",
    constructor: function() {return 0},
    destructor: function() {return 0},},
  { name: "instructions",
    constructor: instructions_constructor,
    destructor: instructions_destructor }
  ]

function show_next_slide(slides) {
  next_slide = slides.pop()
  next_slide.constructor()
  next_slide.destructor()
  return slides
}

show_next_slide(slides)

// "entity_pretest", "relational_pretest", "training", "entity_posttest", "relational_posttest", "survey", "goodbye"]

function instructions_constructor() {
  slide = $("<div class='slide' id='instructions' >")
  // slide.append($("<img src='images/stanford.png' alt='Stanford University'>"))
  slide.append($("<p>").html("In this experiment, we're interested in your judgments about the membership of shapes into geometric classes. First you will answer some questions, then you will be shown a series of examples, and then you will be asked to answer additional question. It should take about 5 minutes."))
  slide.append($("<p>").html("(Note: you won't be able to preview this HIT before accepting it because it's so short.)"))
  slide.append($("<p>").html("By answering the following questions, you are participating in a study being performed by cognitive scientists in the Stanford Department of Psychology. If you have questions about this research, please contact us at langcoglab@stanford.edu. You must be at least 18 years old to participate. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you."))
  slide.append($("<p>").html("We have recently been made aware that your public Amazon.com profile can be accessed via your worker ID if you do not choose to opt out. If you would like to opt out of this feature, you may follow instructions available <a href ='http://www.amazon.com/gp/help/customer/display.html?nodeId=16465241'> here.  </a>"))

  
  $("body").append(slide)
  $(".slide").hide(); slide.show()

}

function instructions_destructor () {
  // wait x*1,000 milliseconds
  setTimeout(function(){
    console.log("times up")
    $("#instructions").append(
      $("<p>").append(
        $("<button>").text("Next").click(function(){

        })))
  },1000*exp.instruction_wait_time)
}

//make a slide for the relational test. Assumes that the HTML for the #relational_${test_id} div is already on page.
function relational_slide(test_id) {
  table = $("<table align='center'>")
  for (pair of _.shuffle(shape_pairs)) {
    shape1 = pair[0]; shape2 = pair[1]
    if (shape1 != shape2) {
      row = $("<tr>")
      q_id = `r_${test_id}_${shape1}_${shape2}`
      row.append(
        $("<td>").text(`Are all ${shape1} also ${shape2}?`),
        $(`<div class='btn-group' id=${q_id}>`).append(
          $(`<button class="btn btn-primary">`)
            .text('Yes')
            .click( relational_click ),
          $(`<button class="btn btn-danger">`)
            .text('No')
            .click( relational_click )
        )
      )
      table.append(row)
    }
  }
  $(`#relational_${test_id}`).append(
    $('<p>').html("Let us start with some questions."),
    $('<p>').html("Please answer yes or no on each of the questions:"),
    table
    )
  show_slide(`relational_${test_id}`)
}

function relational_click() {
  // change which one is active
  $(this).addClass('active')
  $(this).siblings().removeClass( 'active' ) 
  //grab data from elements using jquery-fu
  question_divs = $(this).parent().parent().siblings().addBack().children("div")
  exp.r_pretest_questions = _.map(question_divs, function(q){ return $(q).attr("id")})
  exp.r_pretest_answers = _.map(question_divs, function(q){ 
    return $(q).children(".active").text() })

  if (_.every(exp.r_pretest_answers)) {
    current_slide = $(this).parentsUntil(".slide")
    current_test = current_test.attr("id")
      
    $(this).parentsUntil(".slide").append(
      $("<p>").append(
        $("<butto>").text("Next").click(function(){
          return "crap"
        })))
  }
}

// grab the answers from a relational slide
function relational_answers(test_id) {
  answers = []
  for (pair in shape_pairs) {
    shape1 = pair[0]; shape2 = pair[1]
    answers.push($(`#r_${test_id}_${shape1}_${shape2} .active`).attr('data-value'))
  }
  return answers
}

//grab both by default
function relational_close() {
  exp.r_pretest_response = relational_answers("pretest")
  exp.r_posttest_response = relational_answers("posttest")
}

function entity_slide(test_id) {
  question_html = ""
  for (q_shape of _.shuffle(shapes)) {
    answer_html = ""
    for (a_shape of _.shuffle(shapes)) {
      a_id = `e_${test_id}_${q_shape}_${a_shape}`
      a_img_src = `shapes/${a_shape}_${_.random(1,3)}.png`
      answer_html += `<td> <img id="${a_id}" class="withoutHover objTable" width="100px" height="100px" src="${a_img_src}" onclick="$('#${a_id}').toggleClass('highlighted')"> </td>`
    }
    question_html += `<br> Which is a ${q_shape}? <br> <table align="center"> <tr> ${answer_html} </tr> </table>`
  }
  entity_html = `In the following questions please select <i>all</i> correct answers. <br> ${question_html} `
  $(`#entity_${test_id}_questions`).html(entity_html)
  show_slide(`entity_${test_id}`)
}

function entity_answers(test_id) {
  answers = []
  for (q_shape of shapes) {
    row_answers = []
    for (a_shape of shapes) {
      row_answers.push( $(`#e_${test_id}_${q_shape}_${a_shape}`).hasClass("highlighted") )
    }
    answers.push(row_answers)
  }
  return answers
}

function entity_close(){
  exp.e_pretest_response = entity_answers("pretest")
  exp.e_posttest_response = entity_answers("posttest")
}


function baseline_training (){
return ""
}

function active_training (){
return ""
}

function responsive_training (){
return ""
}

// creates a randomized table that responds to clicks according quadmods logic
function example_table(shape_of_focus) {

  example_images = []
  for (shape of shapes) {
    for (i of _.range(3)) {
      example_images.push(`${shape}_${ i+1 }`)
    }
  }
  example_images = _.shuffle(example_images)
  table = $("<table align=center>")
  for (i of _.range(4)) {
    row = $("<tr>")
    for (j of _.range(3)) {
      img = example_images[i+j*4]
      row.append( $("<td>").append(
        $(`<img width=100px height=100px id="${img}" class="unchosen" onclick="click_shape('${img}')" src="shapes/${img}.png">`)
      ))
    }
    table.append(row)
  }
  return table
}

function click_shape(img_id) {
  if (exp.num_examples_clicked == exp.num_examples_to_show) {
    return
  } else {
    shape = img_id.split("_")[0]
    correct = _.contains(exp.subset_shapes(),shape)
    $(`#${img_id}`).addClass(correct ? "chosenCorrect" : "chosenIncorrect").removeClass("unchosen")
    exp.num_examples_clicked += 1
  }
}

function training_slide() {
	// record start time
	startTime = new Date();
	exp.training_starttime = startTime

  $("#training").prepend(
    $("<p>").html(`We are going to learn about what a <b>${exp.shape_of_focus}</b> is.`),
    $("<p>").html(`On the basis of your responses, a teacher has chosen three examples to show you what <b> ${ pluralize_shapes[exp.shape_of_focus] }</b> are.`),
    $("<p>").html(`Click on the three shapes with the boxes around them to learn whether each one is a <b> ${exp.shape_of_focus}</b> or not.`),
    $("<p>").html(`If it is a <b> ${exp.shape_of_focus}</b>, it will turn <font color='blue'>blue</font> when you click it. If it is not, it will turn <font color='red'>red</font>. After you are done, you will be tested again on your knowledge.`),
    example_table(exp.shape_of_focus)
  )

  // training_html += example_table(exp.shape_of_focus)

  // switch (exp.training_regime) {
  //   case "baseline":
  //     training_html += baseline_training();break;
  //   case "active":
  //     training_html += active_training();break;
  //   case "responsive":
  //     training_html += responsive_training();break;
  // }
  // html(training_html)
  show_slide("training")
}

function training_close() {

}


function post_test_slide() {
	endTime = new Date();
	times.push(endTime);
	var post_questions = "Please answer these yes or no questions: <br><br>";
	post_questions += '<table align="center">';
	for (var i = 0; i < questions.length; i++) {
		post_questions += "<tr><td>";
		var perm_index = permutations[i];
		post_questions += questions[perm_index];
		post_questions += " &nbsp &nbsp </td><td>";
		post_questions += "<div class='btn-group' data-toggle='buttons-checkbox' id=" + posttest_bootstrap[i] + ">";
        post_questions += "<button type='button' class='btn btn-primary' data-value='0' onclick ='exp.boostrap_post_button_select(\"posttest_" + String(i) +"\", 0, " + String(i) +  ")'>Yes</button>";
        post_questions += "<button type='button' class='btn btn-danger' data-value='1' onclick ='exp.boostrap_post_button_select(\"posttest_" + String(i) +"\", 1,  " + String(i) +  ")'>No</button>";
        post_questions += "</div> <br>";
	    post_questions += "</td></tr>";
	};
	post_questions += "</table>";
	$("#post_test_questions").html(post_questions);
	show_slide("post_test");
}

function final_slide() {
	show_slide("final_questions");
}

// Managing the bootstrap buttons
function boostrap_pre_button_select(group_id, button_val, i) {
	// De-activating all of the buttons but the selected one
	var referent = "#" + group_id + " button";
	$(referent).removeClass("active");
	var this_index = permutations.indexOf(i);
	exp.pretest_responses_by_presented_order[i] = button_val;
	exp.pretest_responses[this_index] = button_val;
}

// Managing the bootstrap buttons
function boostrap_post_button_select(group_id, button_val, i) {
	// De-activating all of the buttons but the selected one
	var referent = "#" + group_id + " button";
	$(referent).removeClass("active");
  	var this_index = permutations.indexOf(i);
  	exp.posttest_responses_by_presented_order[i] = button_val;
  	exp.posttest_responses[this_index] = button_val;
}


// FINISHED BUTTON CHECKS EVERYTHING AND THEN ENDS
function check_finished() {
  if (document.getElementById('about').value.length < 1) {
      $("#checkMessage").html('<font color="red">' +
  		       'Please make sure you have answered all the questions!' +
  		       '</font>');
  } else {
      exp.about = document.getElementById("about").value;
      exp.comment = document.getElementById("comments").value;
      exp.age = document.getElementById("age").value;
      exp.gender = document.getElementById("gender").value;

      exp.guesses = guessed_shapes;
      exp.training_time = times[1] - times[0];
      show_slide("finished");

      // HERE you can performe the needed boolean logic to properly account for the target_filler_sequence possibilities.
      // In other words, here you can check whether the choice is correct depending on the nature of the trial.


      exp.end();
  }
}

// END FUNCTION
function end() {
	show_slide("finished");
	setTimeout(function () {
    turk.submit(experiment);
        }, 500);
}
