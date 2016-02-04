// Basic inputs

conditions = ["baseline", "active", "responsive"]
shapes = ["square", "rectangle", "rhombus", "parallelogram"];

exp = {
  num_examples_to_show: 3,
  num_examples_clicked: 0,
  instruction_wait_time: 3,
}

// urls are of the form: https://website.com/?shape=0&condition=0&assignmentId=123RVWYBAZW00EXAMPLE456RVWYBAZW00EXAMPLE&hitId=123RVWYBAZW00EXAMPLE&turkSubmitTo=https://www.mturk.com/&workerId=AZ3456EXAMPLE

// the shape parameter is either 0,1,2,3, or r for the items in the `shapes` list or random
// the condition parameter is either 0,1,2,3, or r for items in the `conditions` list or random

//set parameters based on url
url = $.url()
shape_param = url.attr('shape') || 'r'
cond_param = url.attr('condition') || 'r'
exp.shape =  shape_param == 'r' ? _.sample(shapes) : shapes[shape_param]
exp.condition =  cond_param == 'r' ? _.sample(conditions) : conditions[shape_param]


// now build some useful data

pluralize_shapes = {"square":"squares", "rectangle":"rectangles", "rhombus":"rhombuses", "parallelogram":"parallelograms"};
subset_shapes = { 
  "parallelogram": {
    "square":true, 
    "rhombus":true, 
    "rectangle":true, 
    "parallelogram":true},
  "rectangle": {
    "square":true, 
    "rhombus":false, 
    "rectangle":true, 
    "parallelogram":false},
  "rhombus": {
    "square":true, 
    "rhombus":true, 
    "rectangle":false, 
    "parallelogram":false},
  "square": {
    "square":true, 
    "rhombus":false, 
    "rectangle":false, 
    "parallelogram":false},
}
shape_pairs = []
for (shape1 of shapes) {
  for (shape2 of shapes) {
    if (shape1 != shape2){
      shape_pairs.push([shape1, shape2])
    }
  }
}

function score_entity() {
  scores = {}
  for (q_shape of shapes) {
    scores[q_shape] = 0
    for (a_shape of shapes) {
      correct = exp["e_pretest"][`${q_shape}_${a_shape}`] == subset_shapes[q_shape][a_shape]
      scores[q_shape] += correct
    }
  }
  exp["e_scores"] = scores
  return scores
}

// each of these should have a div in the html file
// here, we pair each slide with a constructor and check function


// SLIDES
// the way slides are going to work is that each slide will have a constructor that uses jquery to build it out of html and a destructor that runs after the constructor, sets the conditions for either destruction or the creation of a "next" button, and determines what goes into that button.

// the slide array is a stack. next_slide pops off the top and executes a constructor and destructor. the order the slides should be in might seem opposite of what's expected. like [last_slide, ..., second_slide, first_slide]
slides= [
  // { name: "final",
  //   constructor: function() {return 0},
  //   destructor: function() {return 0},},
  // { name: "survey",
  //   constructor: survey_constructor,
  //   destructor: survey_destructor },
  { name: "relational_posttest",
    constructor: function() { relational_slide("posttest") },
    destructor: function () {return "boop"} },
  { name: "entity_posttest",
    constructor: function() { entity_slide("posttest") },
    destructor: function () {return "boop"} },
  // { name: "training",
  //   constructor: training_constructor,
  //   destructor: training_destructor },
  { name: "relational_pretest",
    constructor: function() { relational_slide("pretest") },
    destructor: function () {return "boop"} },
  { name: "entity_pretest",
    constructor: function() { entity_slide("pretest") },
    destructor: function () {return "boop"} },
  { name: "instructions",
    constructor: instructions_constructor,
    destructor: instructions_destructor }
  ]

function show_next_slide(slides) {
  next_slide = slides.pop()
  next_slide.constructor()
  next_slide.destructor()
}

show_next_slide(slides)

// "entity_pretest", "relational_pretest", "training", "entity_posttest", "relational_posttest", "survey", "goodbye"]

function instructions_constructor() {
  slide = $("<div class='slide' id='instructions-slide' >")
  text = $("<div class='block-text' id='instructions-text'>"); slide.append(text)
  // slide.append($("<img src='images/stanford.png' alt='Stanford University'>"))
  text.append($("<p>").html("In this experiment, we're interested in your judgments about the membership of shapes into geometric classes. First you will answer some questions, then you will be shown a series of examples, and then you will be asked to answer additional question. It should take about 5 minutes."))
  text.append($("<p>").html("(Note: you won't be able to preview this HIT before accepting it because it's so short.)"))
  text.append($("<p>").html("By answering the following questions, you are participating in a study being performed by cognitive scientists in the Stanford Department of Psychology. If you have questions about this research, please contact us at langcoglab@stanford.edu. You must be at least 18 years old to participate. Your participation in this research is voluntary. You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. Your anonymity is assured; the researchers who have requested your participation will not receive any personal information about you."))
  text.append($("<p>").html("We have recently been made aware that your public Amazon.com profile can be accessed via your worker ID if you do not choose to opt out. If you would like to opt out of this feature, you may follow instructions available <a href ='http://www.amazon.com/gp/help/customer/display.html?nodeId=16465241'> here.  </a>"))
  text.append($("<p>").html("The button to proceed is delayed for 3 seconds to ensure that you have read these instructions."))
  $("body").append(slide)
  $(".slide").hide(); slide.show()
}

function instructions_destructor () {
  // wait x*1,000 milliseconds
  setTimeout(function(){
    console.log("times up")
    $("#instructions-text").append(
      $("<p>").append(
        $("<button>").text("Next").click(function(){
          show_next_slide(slides)
        })))
  },1000*exp.instruction_wait_time)
}

//make a slide for the relational test. Assumes that the HTML for the #relational_${test_id} div is already on page.
function relational_slide(test_id) {
  slide = $(`<div class='slide' id='relational_${test_id}' >`)
  text = $(`<div class='block-text' id='relational_text_${test_id}'>`); slide.append(text)
  table = $("<table align='center'>")
  for (pair of _.shuffle(shape_pairs)) {
    shape1 = pair[0]; shape2 = pair[1]
    if (shape1 != shape2) {
      row = $("<tr>")
      q_id = `r_${test_id}_${shape1}_${shape2}`
      row.append(
        $("<td>").text(`Are all ${shape1} also ${shape2}?`),
        $(`<div class='btn-group' id=${q_id}>`).append(
          $(`<button class="btn btn-primary btn-relational">`)
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
  text.append(
    $('<p>').html("Now for a few questions."),
    $('<p>').html("Please answer yes or no on each of the questions:"),
    table)
  $("body").append(slide)
  $(".slide").hide(); slide.show()
}

function relational_click() {
  // get id
  test_id = $(this).parents(".slide").attr("id").split("_").pop()
 
  console.log(test_id)
  // change which one is active
  $(this).addClass('active')
  $(this).siblings().removeClass( 'active' ) 
  //grab data from elements using jquery-fu
  question_divs = $(this).parent().parent().siblings().addBack().children("div")
  exp["r_questions_" +test_id] = _.map(question_divs, function(q){ return $(q).attr("id")})
  exp["r_answers_" +test_id] = _.map(question_divs, function(q){ 
    return $(q).children(".active").text() })

  if (_.every(exp["r_answers_" +test_id])) {      
    $(this).parents(".block-text").append(
      $("<p>").append(
        $("<button>").text("Next").click(function(){
          show_next_slide(slides)
        })))
  }
}

function entity_slide(test_id) {
  slide = $(`<div class='slide' id='relational_${test_id}' >`)
  text = $(`<div class='block-text' id='relational_text_${test_id}'>`); slide.append(text)
  text.append(
      $("<p>").html("In the following questions please select <i>all</i> correct answers."))
  for (q_shape of _.shuffle(shapes)) {
    table = $("<table align='center'>"); row = $("<tr>")
    text.append(
      $("<p>").html(`Which is a ${q_shape}?`),
      table.append(row))
    for (a_shape of _.shuffle(shapes)) {
      a_id = `e_${test_id}_${q_shape}_${a_shape}`
      a_img_src = `shapes/${a_shape}_${_.random(1,3)}.png`
      row.append(
        $("<td>").append(
          $(`<img id="${a_id}" class="withoutHover objTable" width="100px" height="100px" src="${a_img_src}">`).click(
            entity_click)))
    }
  }
  text.append($("<p>").append($("<button>").text("Next").click(
    function(){ show_next_slide(slides) })))
  $("body").append(slide)
  $(".slide").hide(); slide.show()
}

function entity_click() {
  test_id = $(this).parents(".slide").attr("id").split("_").pop()
  $(this).toggleClass("highlighted")
  responses = {}
  for (q_shape of shapes) {
    for (a_shape of shapes) {
      responses[`${q_shape}_${a_shape}`] = $(`#e_${test_id}_${q_shape}_${a_shape}`).hasClass("highlighted")
    }
  }
  exp[`e_${test_id}`] = responses
}

function baseline_training (){
return ""
}

function active_training (){
return ""
}

function responsive_training (){
  scores = score_entity()
  min_score = _.min(score_entity()) // run code to score entity test
  min_shapes = _.filter(_.keys(scores))

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
