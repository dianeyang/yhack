(function($) {

	var alchemyKey = "fdae1fa9a0bf96edd0a007b8661761c29ca0dd85";

	$(document).ready(function() {
		$('.cover > h1, .cover > i').delay(500).fadeIn(1000);

		$('.cover > i')

	    $('textarea#speech-page-content').bind('input propertychange', $.debounce(250, analysis));
		var start_time;

		$('i.fa-microphone, div#speech-content-elements').click(function() {
			$('#instructions').animate({height:0, opacity: 0.8, display: 'none'}, 100, function () {
				$('#instructions').remove();
			});
			$('#speech-page-content').css({backgroundImage: 'none'});

		});

		// $('<div id="mic-tipsy" class="tipsy tipsy-n"></div>').insertAfter('i.fa-microphone')
		// $('#mic-tipsy').append('<div class="tipsy-arrow tipsy-arrow-n"></div><div class="tipsy-inner">Click microphone to record</div>')

		// $('<div id="text-tipsy" class="tipsy tipsy-w"></div>').insertAfter('#speech-content-elements')
		// $('#text-tipsy').append('<div class="tipsy-arrow tipsy-arrow-n"></div><div class="tipsy-inner">Or, enter text to begin</div>')

		//$('.fa fa-microphone').tipsy({gravity: 'n'});
		// FREQUENCY VIEW
		function gotStream(stream)
		{
		    // create the audio context (chrome only for now)
		    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    		var context = new AudioContext();
		    var audioBuffer;
		    var sourceNode;
		    var analyser;
		    var javascriptNode;

		    // get the context from the canvas to draw on
		    var ctx = $("#frequency").get()[0].getContext("2d");

		    // create a gradient for the fill. Note the strange
		    // offset, since the gradient is calculated based on
		    // the canvas, not the specific element we draw
		    var gradient = ctx.createLinearGradient(0,0,0,45);
		    gradient.addColorStop(1,'#f3805c');
		    gradient.addColorStop(0,'#f3805c');

		    // load the sound
		    setupAudioNodes(stream);

		    function setupAudioNodes(stream) {

		        // setup a javascript node
		        javascriptNode = context.createJavaScriptNode(2048, 1, 1);
		        // connect to destination, else it isn't called
		        javascriptNode.connect(context.destination);


		        // setup a analyzer
		        analyser = context.createAnalyser();
		        analyser.smoothingTimeConstant = 0.6;
		        analyser.fftSize = 128;

		        // create a source node
		        sourceNode = context.createMediaStreamSource(stream);
		        sourceNode.connect(analyser);
		        analyser.connect(javascriptNode);

		        sourceNode.connect(context.destination);

		        start_time = new Date().getTime();

		    }

		    // when the javascript node is called
		    // we use information from the analyzer node
		    // to draw the volume
		    javascriptNode.onaudioprocess = function() {

		        // get the average for the first channel
		        var array =  new Uint8Array(analyser.frequencyBinCount);
		        analyser.getByteFrequencyData(array);

		        // clear the current state
		        ctx.clearRect(0, 0, 64, 45);

		        // set the fill style
		        ctx.fillStyle=gradient;
		        drawSpectrum(array);

		    }

		    function drawSpectrum(array) {
		        for (var i = 0; i < 8; i++ ){
		            var value = array[i]/325*20;
		            j = i;
		            if (i == 0 || i == 1)
		            	value = Math.max(0, value - 3);
		            if (i == 2)
		            	value = Math.max(0, value - 1);
		            ctx.fillRect(j*8,44-value*4.5,6,value*4.5+2);
		        }
		    };
		}
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		navigator.getUserMedia({audio:true}, gotStream);
		// END FREQUENCY VIEW

	    $('#speech-page-content').bind('input propertychange', $.debounce(250, analysis));

	    function analysis() {

	    	// List keywords
	        var jqxhr = $.ajax({
	        	url: "https://access.alchemyapi.com/calls/text/TextGetRankedKeywords",
	            jsonp: "jsonp",
	            dataType: "jsonp",
	            type: "POST",
	            data: {
	                apikey: alchemyKey,
	                text: $('#speech-page-content')[0].innerText.trim(),
	                outputMode: "json",
	                keywordExtractMode: "strict",
	                sentiment: "1"
	            },
	            success: function (data) {
	            	var blanks = new Array;
				var wordarray = new Array;
				
				setInterval(function(){
					blanks.push(" ");
					wordarray.push(get_word_count());
				    $(function () { 
					    $('#chart2').highcharts({
					        chart: {
					        	width: $("#chart2").width(),
					            type: 'line',
					            backgroundColor: null,
					            style: {
					            	fontFamily: 'Varela Round',
					            	color: '#FFFFFF'
					            }
					        },
					        title: {
					            text: 'Words over time',
					            style: {
					            	fontFamily: 'Varela Round',
					            	fontSize: '16px',
					            	color: '#FFFFFF'
					            }
					        },
					        xAxis: {
					            categories: blanks,
					            lineColor: '#FFFFFF',
					            tickColor: '#FFFFFF',
					            style: {
					            	fontFamily: 'Varela Round',
					            	color: '#FFFFFF'
					            },
					            labels: {
							        style: {
							            color: '#FFFFFF',
							            fontFamily: 'Varela Round'
							        }
							    },
					        },
					        yAxis: {
					        	lineColor: '#FFFFFF',
					        	tickColor: '#FFFFFF',
					            title: {
					                text: 'Words',
					                style: {
						            	fontFamily: 'Varela Round',
						            	color: '#FFFFFF'
						            }
						        },
						        labels: {
						        	style: {
					            		fontFamily: 'Varela Round',
					            		color: '#FFFFFF'
					            	}
					            }
					        },
					        series: [{
					            name: 'time',
					            data: wordarray,
					            color: '#FFFFFF',
					            style: {
					            	color: '#FFFFFF',
					            	fontFamily: 'Varela Round'
					            }
					        }],
					    });
					});
				},4000);


	            	console.log(data);
	            	render_vitals(data.language);
	            	var len = data.keywords.length;
	            	$("#results").html("");
	            	var myData = new Array;
	            	var temp = new Array(len);
	            	myData[0] = 1*data.keywords[0].sentiment.score;
	            	temp[0] = " ";
	            	// $("#results").append($("<div><strong>"+data.keywords[0].text+"</strong> ("+data.keywords[0].relevance+")</div>"));
				  	for (var i = 1; i < len; i++) {
						// $("#results").append($("<div><strong>"+data.keywords[i].text+"</strong> ("+data.keywords[i].relevance+")</div>"));
						myData[i] = (1*myData[i-1])+(1*data.keywords[i].sentiment.score);
						temp[i] = " ";
					}
				    
				    $(function () { 
					    $('#highcharts').highcharts({
					        chart: {
					            type: 'line',
					            backgroundColor: null,
					            style: {
					            	fontFamily: 'Varela Round',
					            	color: '#FFFFFF'
					            },
					            height: $("#highcharts").height()
					        },
					        title: {
					            text: 'Mood vs. text',
					            style: {
					            	fontFamily: 'Varela Round',
					            	fontSize: '16px',
					            	color: '#FFFFFF'
					            }
					        },
					        xAxis: {
					            categories: temp,
					            lineColor: '#FFFFFF',
					            tickColor: '#FFFFFF',
					            style: {
					            	fontFamily: 'Varela Round',
					            	color: '#FFFFFF'
					            },
					            labels: {
							        style: {
							            color: '#FFFFFF',
							            fontFamily: 'Varela Round'
							        }
							    },
					        },
					        yAxis: {
					        	lineColor: '#FFFFFF',
					        	tickColor: '#FFFFFF',
					            title: {
					                text: 'Mood',
					                style: {
						            	fontFamily: 'Varela Round',
						            	color: '#FFFFFF'
						            }
						        },
						        labels: {
						        	style: {
					            		fontFamily: 'Varela Round',
					            		color: '#FFFFFF'
					            	}
					            }
					        },
					        series: [{
					            name: 'Text',
					            data: myData,
					            color: '#FFFFFF',
					            style: {
					            	color: '#FFFFFF',
					            	fontFamily: 'Varela Round'
					            }
					        }],
					    });
					});
				    /*
				    var ndata = {
						labels : temp,
						datasets : [
							{
								fillColor : "rgba(220,220,220,0.5)",
								strokeColor : "rgba(220,220,220,1)",
								pointColor : "rgba(220,220,220,1)",
								pointStrokeColor : "#fff",
								data : myData
							}
						]
					}
				    
				    var options = {
				
					//Boolean - If we show the scale above the chart data			
					scaleOverlay : false,
					
					//Boolean - If we want to override with a hard coded scale
					scaleOverride : false,
					
					//** Required if scaleOverride is true **
					//Number - The number of steps in a hard coded scale
					scaleSteps : null,
					//Number - The value jump in the hard coded scale
					scaleStepWidth : null,
					//Number - The scale starting value
					scaleStartValue : null,
				
					//String - Colour of the scale line	
					scaleLineColor : "rgba(0,0,0,.1)",
					
					//Number - Pixel width of the scale line	
					scaleLineWidth : 1,
				
					//Boolean - Whether to show labels on the scale	
					scaleShowLabels : true,
					
					//Interpolated JS string - can access value
					scaleLabel : "<%=value%>",
					
					//String - Scale label font declaration for the scale label
					scaleFontFamily : "'Arial'",
					
					//Number - Scale label font size in pixels	
					scaleFontSize : 12,
					
					//String - Scale label font weight style	
					scaleFontStyle : "normal",
					
					//String - Scale label font colour	
					scaleFontColor : "#666",	
					
					///Boolean - Whether grid lines are shown across the chart
					scaleShowGridLines : true,
					
					//String - Colour of the grid lines
					scaleGridLineColor : "rgba(0,0,0,.05)",
					
					//Number - Width of the grid lines
					scaleGridLineWidth : 1,	
					
					//Boolean - Whether the line is curved between points
					bezierCurve : true,
					
					//Boolean - Whether to show a dot for each point
					pointDot : true,
					
					//Number - Radius of each point dot in pixels
					pointDotRadius : 3,
					
					//Number - Pixel width of point dot stroke
					pointDotStrokeWidth : 1,
					
					//Boolean - Whether to show a stroke for datasets
					datasetStroke : true,
					
					//Number - Pixel width of dataset stroke
					datasetStrokeWidth : 2,
					
					//Boolean - Whether to fill the dataset with a colour
					datasetFill : true,
					
					//Boolean - Whether to animate the chart
					animation : true,
				
					//Number - Number of animation steps
					animationSteps : 60,
					
					//String - Animation easing effect
					animationEasing : "easeOutQuart",
				
					//Function - Fires when the animation is complete
					onAnimationComplete : null
					
				}
				    
				    
					var ctx = document.getElementById("myChart").getContext("2d");
					var myNewChart = new Chart(ctx)
					new Chart(ctx).Line(ndata);*/
				    
				  var fill = d3.scale.category20c();
				  
				  var cloud = $("#cloud");

				  cloud.html("");
				  
				  d3.layout.cloud().size([cloud.width(), cloud.height()])
				      .words((data.keywords).map(function(d) {
				        return {text: d.text, size: 50 * (d.relevance * (Math.sqrt(Math.sqrt(d.relevance))))};
				      }))
				      .padding(5)
				      .rotate(function() { return ~~0; })
				      .font("Varela Round")
				      .fontSize(function(d) { return d.size; })
				      .on("end", draw)
				      .start();
				      
				  function draw(words) {
				    d3.select("#cloud").append("svg")
				        .attr("width", cloud.width())
				        .attr("height", cloud.height())
				      .append("g")
				        .attr("transform", "translate(150,120)")
				      .selectAll("text")
				        .data(words)
				      .enter().append("text")
				        .style("font-size", function(d) { return d.size + "px"; })
				        .style("font-family", "Varela Round")
				        .style("fill", function(d, i) { return fill(i); })
				        .attr("text-anchor", "middle")
				        .attr("transform", function(d) {
				          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
				        })
				        .text(function(d) { return d.text; });
				        
				  }
				
				
	            }
	        });


	    };

	    function render_vitals(language) {
	    	stats = get_vitals();
	    	word_count = stats[0];
	    	min = String(Math.floor(stats[1] / (1000 * 60)));
	    	sec = Math.floor(stats[1] / (1000)) % 60 < 10 ? '0' + String(Math.floor(stats[1] / (1000)) % 60) : String(Math.floor(stats[1] / (1000)) % 60);
	    	duration =  min + ':' + sec;
	    	wpm = stats[2].toFixed(2);
	    	$('#vitals').html('');
	    	elt = '<strong>Word count:</strong> ' + word_count + '<br/><strong>Duration:</strong> ' + duration + '<br/><strong>Words per minute:</strong> ' + wpm + '<br/>';
	    	$('#vitals').append(elt);
	    };


	    function get_vitals() {
	    	word_count = get_word_count();
	    	duration = get_duration();
	    	wpm = word_count / (duration / (1000 * 60));
	    	console.log(word_count);
	    	console.log(duration);
	    	console.log(wpm);
	    	return [word_count, duration, wpm];
	    };

	    function get_word_count() {
	    	return $('#speech-page-content')[0].innerText.trim().split(/[\s\n]/g).length;
	    };

	    function get_duration() {
	    	curr_time = new Date().getTime();
	    	diff = curr_time - start_time;
	    	return diff;
	    };

	    function highlight_keywords() {
	    	//T0D0
	    }

	    //slide_up();
	 //    function set_viz_height() {
		// 	height = $(window).height() - $('.cover').height() - $('#footer').height();
		// 	$('.dataviz').animate({height:height}, 500);
		// };
		// $.delay(800);
		// set_viz_height();
	    // $('.cover').click(slide_up);

	    // function slide_up() {
	    // 	$('.cover').animate({
	    // 		height: 60,
	    // 		paddingTop: "5px"
	    // 	}, 10);
	    // 	$('.cover > i').animate({
	    // 		fontSize: "40px",
	    // 		paddingTop: "5px"
	    // 	}, 10);
	    // 	$('.microphone.large').removeClass('large').animate({
	    // 		height: "85%",
  			// 	background: "url('../images/microphone2.svg') no-repeat top center",
	    // 	}, 10);
	    // 	$('.cover h1').animate({
	    // 		opacity: 0,
	    // 		fontSize: "30px"
	    // 	}, 8, function() {
	    // 		$('.cover h1').remove();
	    // 	});
	    // };
	});

})(jQuery);

function handlepaste (elem, e) {
    var savedcontent = elem.innerHTML;
    if (e && e.clipboardData && e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
        if (/text\/html/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/html');
        }
        else if (/text\/plain/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/plain');
        }
        else {
            elem.innerHTML = "";
        }
        waitforpastedata(elem, savedcontent);
        if (e.preventDefault) {
                e.stopPropagation();
                e.preventDefault();
        }
        return false;
    }
    else {// Everything else - empty editdiv and allow browser to paste content into it, then cleanup
        elem.innerHTML = "";
        waitforpastedata(elem, savedcontent);
        return true;
    }
}

function waitforpastedata (elem, savedcontent) {
    if (elem.childNodes && elem.childNodes.length > 0) {
        processpaste(elem, savedcontent);
    }
    else {
        that = {
            e: elem,
            s: savedcontent
        }
        that.callself = function () {
            waitforpastedata(that.e, that.s)
        }
        setTimeout(that.callself,20);
    }
}

function processpaste (elem, savedcontent) {
    pasteddata = elem.innerHTML;
    //^^Alternatively loop through dom (elem.childNodes or elem.getElementsByTagName) here

    elem.innerHTML = elem.textContent;

    analysis();

    // Do whatever with gathered data;
    //alert(elem.textContent);
}
