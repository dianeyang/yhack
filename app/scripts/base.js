(function($) {

	var alchemyKey = "e2490766ea3f66849fadc9a7b8d8b51af58d0a93";

	$(document).ready(function() {
		$('.cover > h1, .cover > i').delay(500).fadeIn(1000);

	    $('textarea#speech-page-content').bind('input propertychange', $.debounce(250, do_something));

	    function do_something() {
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
	            	console.log(data);

	            	var len = data.keywords.length;
					for (var i = 0; i < len; i++)
					{
						$("#results").append($("<div><strong>"+data.keywords[i].text+"</strong> ("+data.keywords[i].relevance+")</div>"));
					}

	            }
	        });
	    };

	    $('textarea').autosize();

	    $('.cover').click(slide_up);

	    function slide_up() {
	    	$('.cover').hide().fadeIn(300);
	    	$('.cover').animate({
	    		height: 60,
	    		paddingTop: "5px"
	    	}, 1000);
	    	$('.cover > i').animate({
	    		fontSize: "40px"
	    	}, 1000);
	    	$('.microphone.large').removeClass('large').animate({
	    		height: "85%",
  				background: "url('../images/microphone2.svg') no-repeat top center",
	    	}, 1000);
	    	$('.cover h1').animate({
	    		opacity: 0,
	    		fontSize: "30px"
	    	}, 800, function() {
	    		$('.cover h1').remove();
	    	});
	    };
	});

})(jQuery);