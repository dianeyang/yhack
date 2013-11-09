(function($) {

	var alchemyKey = "e2490766ea3f66849fadc9a7b8d8b51af58d0a93";

	$(document).ready(function() {
		$('.cover > h1, .cover > i').delay(500).fadeIn(1000);

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
	                text: $('#speech-page-content')[0].textContent,
	                outputMode: "json",
	                keywordExtractMode: "strict",
	                sentiment: "1"
	            },
	            success: function (data) {
	            	console.log(data);
	            	$("#results").html("");
	            	var len = data.keywords.length;
	            	$("#results").html("");
	            	var myData = new Array;
	            	var temp = new Array(len);
	            	myData[0] = 1*data.keywords[0].sentiment.score;
	            	temp[0] = " ";
	            	$("#results").append($("<div><strong>"+data.keywords[0].text+"</strong> ("+data.keywords[0].relevance+")</div>"));
				  	for (var i = 1; i < len; i++) {
						$("#results").append($("<div><strong>"+data.keywords[i].text+"</strong> ("+data.keywords[i].relevance+")</div>"));
						myData[i] = (1*myData[i-1])+(1*data.keywords[i].sentiment.score);
						temp[i] = " ";
					}
				    
				    $(function () { 
					    $('#highcharts').highcharts({
					        chart: {
					            type: 'line'
					        },
					        title: {
					            text: 'Mood Over Time'
					        },
					        xAxis: {
					            categories: temp
					        },
					        yAxis: {
					            title: {
					                text: 'Mood'
					            }
					        },
					        series: [{
					            name: 'Time',
					            data: myData
					        }]
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
				    
				  var fill = d3.scale.category20();
				  
				  $("#cloud").html("");
				  
				  d3.layout.cloud().size([600, 600])
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
				        .attr("width", 600)
				        .attr("height", 600)
				      .append("g")
				        .attr("transform", "translate(300,300)")
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


	    slide_up();
	    // $('.cover').click(slide_up);

	    function slide_up() {
	    	$('.cover').animate({
	    		height: 60,
	    		paddingTop: "5px"
	    	}, 10);
	    	$('.cover > i').animate({
	    		fontSize: "40px",
	    		paddingTop: "5px"
	    	}, 10);
	    	$('.microphone.large').removeClass('large').animate({
	    		height: "85%",
  				background: "url('../images/microphone2.svg') no-repeat top center",
	    	}, 10);
	    	$('.cover h1').animate({
	    		opacity: 0,
	    		fontSize: "30px"
	    	}, 8, function() {
	    		$('.cover h1').remove();
	    	});
	    };
	});

})(jQuery);