(function($) {

	var alchemyKey = "e2490766ea3f66849fadc9a7b8d8b51af58d0a93";

	$(document).ready(function() {
		$('.microphone, .cover > h1').delay(500).fadeIn(1000);

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
	                keywordExtractMode: "strict",
	                sentiment: "1"
	            },
	            success: function (data) {
	            	
	              //  temp.exit().remove()	
	            	
	            	console.log(data);
	            	var len = data.keywords.length;
	            	var sentiment = 0;
	            	$("#results").html("");
	            	$("#sentiment").html("");
					for (var i = 0; i < len; i++)
					{
						sentiment = (1*sentiment)+(1*(data.keywords[i].sentiment.score));
					}
					$("#sentiment").append(sentiment);
				  	for (var i = 0; i < len; i++)
					{
						$("#results").append($("<div><strong>"+data.keywords[i].text+"</strong> ("+data.keywords[i].relevance+")</div>"));
					}
				  
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