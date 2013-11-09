(function($) {

    $(document).ready(function() {

        try {
            var recognition = new webkitSpeechRecognition();
        } catch(e) {
            var recognition = Object;
        }
        recognition.continuous = true;
        recognition.interimResults = true;

        var interimResult = '';
        var transcript = $('#speech-page-content');
        var textAreaID = 'speech-page-content';

        $('i.fa-microphone:not(.recording)').click(function(){
            startRecognition();
        });

        $('.recording').click(function(){
            recognition.stop();
        });

        var startRecognition = function() {
            $('.cover i.fa-microphone').toggleClass('recording');
            transcript.focus();
            recognition.start();
        };

        recognition.onresult = function (event) {
            console.log(event);
            // var pos = textArea.getCursorPosition() - interimResult.length;
            // textArea.val(textArea.val().replace(interimResult, ''));
            // interimResult = '';
            // textArea.setCursorPosition(pos);
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript.append("<span>"+event.results[i][0].transcript+"</span>");
                    // insertAtCaret(textAreaID, event.results[i][0].transcript);
                } else {
                    // isFinished = false;
                    // insertAtCaret(textAreaID, event.results[i][0].transcript + '\u200B');
                    // interimResult += event.results[i][0].transcript + '\u200B';
                }
            }
        };

        recognition.onend = function() {
            $('.cover i.fa-microphone').toggleClass('recording');
        };
    });
})(jQuery);