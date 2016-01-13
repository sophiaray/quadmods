
// ---------------- 3. CONTROL FLOW ------------------
// This .js file determines the flow of the variable elements in the experiment as dictated
// by the various calls from pragmods html.

/*
Here the images used in the experiment are loaded in two arrays.
The first is base_image_pl, which stores the "underlying" or base images
which will then be modified with props stored in the props_image_pl Array.

NOTE: Unfortunately the number of variations for each type of object is hardcoded.
To make the code more usable it will be necessary to
*/







showSlide("instructions");

// The main experiment:
//		The variable/object 'experiment' has two distinct but interrelated components:
//		1) It collects the variables that will be delivered to Turk at the end of the experiment
//		2) It hall all the functions that change the visual aspect of the experiment such as showing images, etc.

shape_pairs = []
for (shape1 of shapes) {
  for (shape2 of shapes) {
    if (shape1 != shape2){
      shape_pairs.push([shape1, shape2])
    }
  }
}

exp = {
  // These variables are the ones that will be sent to Turk at the end.
  // The first batch, however, is set determined by the experiment conditions
  // and therefore should not be affected by the decisions made by the experimental subject.


  // Order of questions
  permutations_used: permutations,

  // Pre-test answers
  r_pretest_answers,

  // Post-test answers
  r_posttest_answers,

  // Presentation order
  r_pretest_order_as_presented: [],
  r_posttest_order_as_presented: [],


  // Shapes guessed
  guesses: [],

  // Participant demo info
  about: "",
  comment: "",
	age: "",
	gender: "",

	// measuring time of training
	training_time: "",


	// To keep the parameters in the csv file
	all_answers_provided: all_answers_provided,
	questions_permuted: questions_permuted,
	skip_check: skip_check,
	training_condition: training_condition,
	examples_to_show: examples_to_show,
	shape_of_focus: shape_of_focus,


	//build relational slide for both pretest and posttest
	relational_slide: function(test_id) {
		r_pretest_shuffled = _.shuffle(shape_pairs); // shuffle shape pairs to randmoize presentation order	
	    question_html = ""
	    for (pair of r_pretest_shuffled) {
	      shape1 = pair[0]; shape2 = pair[1]
	      if (shape1 != shape2) {
	        q_id = `r_${test_id}_${shape1}_${shape2}`
	        exp.r_pretest_order_as_presented.push(q_id); // store presentation order 
	        question_html += 
		        `<tr> 
		        	<td>Are all ${shape1} also ${shape2}?</td> 
		        	<td> 
		        		<label class="btn btn-default"><input type="radio" name="${q_id}" value="yes"/> Yes</label> 
		        		<label class="btn btn-default"><input type="radio" name="${q_id}" value="no"/> No</label>  
		        	</td> 
		        </tr>`
	      }
    }
    var relational_html = `Let's start with some questions. <br> Please answer yes or no on each of the questions: <br> <br> <table align="center"> ${question_html} </table>`;
    
    $(`#relational_${test_id}_questions`).html(relational_html)
    showSlide(`relational_${test_id}`)
  },

  relational_answers: function (test_id) {
  	// get participants answers in the order they gave them
    answers = []
    for (pair in shape_pairs) {
    	if (test_id == "pretest") {
    		current_pair = exp.r_pretest_order_as_presented[pair]; 
    		answers.push($(`input:radio[name=${current_pair}]:checked`).val())
    	} else {
    		current_pair = exp.r_posttest_order_as_presented[pair]; 
    		answers.push($(`input:radio[name=${current_pair}]:checked`).val())
    	}
    }
    return answers
  },

  relational_close: function () {
    exp.r_pretest_answers = exp.relational_answers("pretest")
    exp.r_posttest_answers = exp.relational_answers("posttest")
  },

  entity_slide: function(test_id) {
    question_html = ""
    for (q_shape of _.shuffle(singular_shapes)) {
      answer_html = ""
      for (a_shape of _.shuffle(singular_shapes)) {
        a_id = `e_${test_id}_${q_shape}_${a_shape}`
        a_img_src = `shapes/${a_shape}_${_.random(1,3)}.png`
        answer_html += `<td> <img id="${a_id}" class="withoutHover objTable" width="100px" height="100px" src="${a_img_src}" onclick="$('#${a_id}').toggleClass('highlighted')"> </td>`
      }
      question_html += `<br> Which is a ${q_shape}?" <br> <table align="center"> <tr> ${answer_html} </tr> </table>`
    }
    entity_html = `In the following questions please select <i>all</i> correct answers. <br> ${question_html} `
    $(`#entity_${test_id}_questions`).html(entity_html)
    showSlide(`entity_${test_id}`)
  },

  entity_answers: function (test_id) {
    answers = []
    for (q_shape of singular_shapes) {
      row_answers = []
      for (a_shape of singular_shapes) {
        row_answers.push( $(`#e_${test_id}_${q_shape}_${a_shape}`).hasClass("highlighted") )
      }
      answers.push(row_answers)
    }
    return answers
  },

  entity_close: function(){
    exp.e_pretest_responses = exp.entity_answers("pretest")
    exp.e_posttest_responses = exp.entity_answers("posttest")
  },


	training_slide: function() {
		// record start time
		startTime = new Date();
		times.push(startTime);
		var training_html = "";

		// set up training slide based on block and condition

		if (training_condition == "active_passive" && block == 1) {
				training_regime = 3; // active learning
			} else if (training_condition == "passive_active" && block == 2) {
				training_regime = 3; // active learning
			} else {
				training_regime = 4; // passive learning
			}

		if (training_regime < 2) {
			training_html += "<center><br> We're going to learn about all the shapes you just ";
			training_html += "answered questions about. <br> Here are examples from each of the ";
			training_html += "categories. Take a close look. <br> After you're done, you will be tested again on your knowledge. </center><br><br>";
			training_html += '<table align="center">';
			for (i = 0; i < 4; i++) {
				training_html += '<tr><td>' + shapes[i] + '</td>';
				for (j = 0; j < 2; j++) {
					training_html += '<td><img width=100px height=100px src=shapes/' + example_list[i][j] + '></td>';
				}
				training_html += '</tr>';
			}
			training_html += '</table>'
		}

		if (training_regime == 2) {
			training_html += "<br> <center>A teacher is going to give you some facts: </center> <br><br>";
			training_html += '<table align="center" >';
			for (i = 0; i < teacher_facts.length; i++) {
				training_html += '<tr><td> Fact #  ' + String(i) + ' </td>';
				training_html += '<td> &nbsp &nbsp' + teacher_facts[i] + '</td>';
				training_html += '</tr>';
			}
			training_html += '</table>'
		}

		// This training regime uses the CSS functionality of highlighting specific images to point out
		// elements of a class of shapes.
		if (training_regime == 3) {
			training_html += "<br>We're going to learn about what a <b>" + singular_shapes[shape_of_focus] +  "</b> is. <br>Click on three of the shapes below to learn whether each one is a " + singular_shapes[shape_of_focus] +  " or not. <br>";
			training_html +=  "If it's a <b>" + singular_shapes[shape_of_focus] +  "</b>, it'll turn <font color='blue'>blue</font> when you click it. If it isn't, it'll turn <font color='red'>red</font>. <br>Choose carefully so that you can learn as much as you can about " + shapes[shape_of_focus] +  ". After you're done, you will be tested again on your knowledge. <br><br>";
			training_html += '<table align="center">';
			for (i = 0; i < 4; i++) {
				training_html += '<tr>';
				for (j = 0; j < 3; j++) {
					training_html += '<td><img width=100px height=100px class="unchosen objTable" id="tdchoice' + String(i) + '_' + String(j) + '"  onclick="exp.guess_this_shape(' + String(i) + ',' + String(j) + ')" src=shapes/' + all_shapes[i][j] + '></td>';
				}
				training_html += '</tr>';
			}
			training_html += '</table>'
		}

		// Passive learning condition
		if (training_regime == 4) {
			training_html +=  "We're going to learn about what a <b>" + singular_shapes[shape_of_focus] +  "</b> is. <br>";
			training_html +=  "On the basis of your responses, a teacher has chosen three examples to show you what <b>" + shapes[shape_of_focus] +  "</b> are. <br>";
			training_html +=  " Click on the three shapes with the boxes around them to learn whether each one is a <b>"+ singular_shapes[shape_of_focus] + "</b> or not. <br>";
			training_html += "If it's a <b>"+ singular_shapes[shape_of_focus] + "</b>, it'll turn <font color='blue'>blue</font> when you click it. If it isn't, it'll turn <font color='red'>red</font>.";
			training_html +=  " After you're done, you will be tested again on your knowledge. <br>";
			training_html += '<table align="center">';
			for (i = 0; i < 4; i++) {
				training_html += '<tr>';
				for (j = 0; j < 3; j++) {
					training_html += '<td><img width=100px height=100px class="withoutHover objTable" id="tdchoice' + String(i) + '_' + String(j) + '"  onclick="exp.select_highlighted_shape(' + String(i) + ',' + String(j) + ')" src=shapes/' + all_shapes[i][j] + '></td>';
				}
				training_html += '</tr>';
			}
			training_html += '</table>'
		}

		// Control layout: Same as in 3 & 4, but no participant action required.
		if (training_regime == 5) {
			training_html +=  "<center> Look at these examples of quadrilaterals. <br> Take your time. After you are done examining this set, <br> you will be tested again on your knowledge. </center><br>";
			training_html += '<table align="center">';
			for (i = 0; i < 4; i++) {
				training_html += '<tr>';
				for (j = 0; j < 3; j++) {
					training_html += '<td><img width=100px height=100px class="withoutHover objTable" id="tdchoice' + String(i) + '_' + String(j) + '" src=shapes/' + all_shapes[i][j] + '></td>';
				}
				training_html += '</tr>';
			}
			training_html += '</table>'
		}
		

		
		$("#training_examples").html(training_html);
		showSlide("training");

		// After instantiation
		if (training_regime == 4) {
			exp.highlight_boxes();
		}
	},
	

	post_test_slide: function(test_id) {

    	post_test_question_html = ""
    	r_post_test_shuffled = _.shuffle(shape_pairs);

	    for (pair of r_post_test_shuffled) {
	      shape1 = pair[0]; shape2 = pair[1]
	      if (shape1 != shape2) {
	        q_id = `r_${test_id}_${shape1}_${shape2}`
	        exp.r_posttest_order_as_presented.push(q_id); // store presentation order
	        post_test_question_html += 
		        `<tr> 
		        	<td>Are all ${shape1} also ${shape2}?</td> 
		        	<td> 
		        		<label class="btn btn-default"><input type="radio" name="${q_id}" value="yes"/> Yes</label> 
		        		<label class="btn btn-default"><input type="radio" name="${q_id}" value="no"/> No</label>  
		        	</td> 
		        </tr>`
	      }
	    }
   		
   		var post_test_html = `Let's start with some questions. <br> Please answer yes or no on each of the questions: <br> <br> <table align="center"> ${post_test_question_html} </table>`;
    
    	$(`#post_test_questions`).html(post_test_html)
    	
    	showSlide("post_test")
  },


	final_slide: function() {
		showSlide("final_questions");
	},


	// Functions for dynamic interaction with the participant:
	//$("#tdchoice" + String(c)).removeClass('unchosen').addClass('chosen')
	select_shape: function(i, j) {
		for (var ii=0; ii<all_shapes.length; ii++) {
			for (var jj = 0; jj<all_shapes[0].length; jj++) {
				$("#tdchoice" + String(ii) + '_' + String(jj)).removeClass('chosen').addClass('unchosen');
			}
		}
		$("#tdchoice" + String(i) + '_' + String(j)).removeClass('unchosen').addClass('chosen');
	},

	// For the case of active and passive teaching
	guess_this_shape: function(i, j) {
		if (examples_clicked < examples_to_show) {
			if ($("#tdchoice" + String(i) + '_' + String(j)).attr("class") == "unchosen objTable") {
				if (isShape[shape_of_focus][i] == 0) {
					$("#tdchoice" + String(i) + '_' + String(j)).removeClass('unchosen').addClass('chosen');
				} else {
					$("#tdchoice" + String(i) + '_' + String(j)).removeClass('unchosen').addClass('chosenCorrect');
				}
				examples_clicked = examples_clicked + 1;
				guessed_shapes.push([i, j]);
			};
		};
		if (examples_clicked == examples_to_show) {
			for (var ii = 0; ii < all_shapes.length; ii++) {
				for (jj = 0; jj < all_shapes[0].length; jj++) {
					$("#tdchoice" + String(ii) + '_' + String(jj)).removeClass('unchosen').addClass('withoutHover');
				};
			};
		};
	},


	highlight_boxes: function() {
		var in_highlighted = 0;
		for (i = 0; i < all_shapes.length; i++) {
			for (j = 0; j < all_shapes[0].length; j++) {
				for (ii = 0; ii <highlighted_boxes.length; ii++) {
					if (highlighted_boxes[ii][0] == i && highlighted_boxes[ii][1] == j) {
						$("#tdchoice" + String(i) + '_' + String(j)).addClass('highlighted');
					}
				}
			}
		}


	},

	select_highlighted_shape: function(i, j) {
		var in_highlighted = 0;
		for (ii = 0; ii < highlighted_boxes.length; ii++) {
			if (highlighted_boxes[ii][0] == i && highlighted_boxes[ii][1] == j) {
				in_highlighted = 1;
			}
		}
		if (examples_clicked < 3 && in_highlighted == 1) {
			if ($("#tdchoice" + String(i) + '_' + String(j)).attr("class") == "withoutHover objTable highlighted") {
				if (isShape[shape_of_focus][i] == 0) {
					$("#tdchoice" + String(i) + '_' + String(j)).removeClass('highlighted').addClass('chosen');
					examples_clicked = examples_clicked + 1;
					guessed_shapes.push([i, j]);
				} else {
					$("#tdchoice" + String(i) + '_' + String(j)).removeClass('highlighted').addClass('chosenCorrect');
					examples_clicked = examples_clicked + 1;
					guessed_shapes.push([i, j]);
				};
			};
		};
	},


	// Tests if the answers to the relational pretest were provided fully
	first_test_check: function(test_id) {
		// call function to get radio button values
		exp.relational_close();
		// check if any are missing
		var one_missing = 0;
		for (var i = 0; i < questions.length; i++) {
			answer_to_i = exp.r_pretest_answers[i];
	    	if (answer_to_i == -1) {
	    		one_missing = 1;
	    	}
		};
    	if (one_missing == 1 && skip_check == 0) {
    		var answer_all_message = '<font color="red">Please answer all the questions.</font>';
    		$("#pre_test_check").html(answer_all_message);
    	} else {
    		exp.entity_slide('pretest') 
    	};
	},

	// check if participant actually completed the training 
	training_test_check: function() {
		if (((training_regime == 3 || training_regime == 4)  && examples_clicked < examples_to_show) && skip_check == 0) {
			var click_on_three = '<font color="red">Please click on three shapes.</font>';
			$("#training_check").html(click_on_three)
		} else {
			if (block == 1) {
				block++
				exp.relational_slide("pretest"); // if in first block, then you go to pretest ("test 1")
			} else {
				// get end of training time
				endTime = new Date();
				times.push(endTime);
				// continue experiment
				exp.post_test_slide("posttest");
			};
		};
	},

	// Tests if the answers to the relational posttest were provided fully. If yes, continue to entity posttest
	second_test_check: function() {
		// call function to get radio button values
		exp.relational_close();

		//check to see if any are missing
		var one_missing = 0;
		for (var i = 0; i < questions.length; i++) {
			answer_to_i = exp.r_posttest_answers[i];
	    	if (answer_to_i == -1) {
	    		one_missing = 1;
	    	}
		};
    	if (one_missing == 1 && skip_check == 0) {
    		var answer_all_message = '<font color="red">Please answer all the questions.</font>';
    		$("#post_test_check").html(answer_all_message);
    	} else {
    		exp.entity_slide('posttest');
    	};
	},


   // FINISHED BUTTON CHECKS EVERYTHING AND THEN ENDS
    check_finished: function() {
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
		    showSlide("finished");

		    // HERE you can performe the needed boolean logic to properly account for the target_filler_sequence possibilities.
		    // In other words, here you can check whether the choice is correct depending on the nature of the trial.


		    exp.end();
		}
    },

    // END FUNCTION
    end: function () {
    	showSlide("finished");
    	setTimeout(function () {
		turk.submit(exp);
        }, 500);
    }
}
