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

	    $('textarea#speech-page-content').bind('input propertychange', $.debounce(250, analysis));

	    function analysis() {

	    	// List keywords
	        var jqxhr = $.ajax({
	        	url: "https://access.alchemyapi.com/calls/text/TextGetRankedKeywords",
	            jsonp: "jsonp",
	            dataType: "jsonp",
	            type: "POST",
	            data: {
	                apikey: alchemyKey,
	                text: $('#speech-page-content').val(),
	                outputMode: "json",
	                keywordExtractMode: "strict"
	            },
	            success: function (data) {
	            	// console.log(data);
	            	$("#results").html("");
	            	var len = data.keywords.length;
					for (var i = 0; i < len; i++)
					{
						$("#results").append($("<div><strong>"+data.keywords[i].text+"</strong> ("+data.keywords[i].relevance+")</div>"));
					}

	            }
	        });


	    };

	    // $('textarea').autosize();

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