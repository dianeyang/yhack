(function($) {

	$(document).ready(function() {
		$('.microphone, .cover > h1').delay(500).fadeIn(1000);

	    $('textarea#speech-page-content').bind('input propertychange', $.debounce(250, do_something));

	    function do_something() {
	        console.log('doing something');
	    };

	    $('.cover').click(slide_up);

	    function slide_up() {
	    	$('.cover').animate({
	    		height: 60,
	    		paddingTop: "5px"
	    	}, 1000);
	    	$('.microphone.large').removeClass('large').animate({
  				background: "url('../images/microphone2.svg') no-repeat top center",
  				height: "50px",
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