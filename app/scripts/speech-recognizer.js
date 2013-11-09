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
        var textArea = $('#speech-page-content');
        var textAreaID = 'speech-page-content';

        $('.cover > i').click(function(){
            console.log('clicked');
            startRecognition();
        });

        $('.recording').click(function(){
            recognition.stop();
        });

        var startRecognition = function() {
            //$('.speech-content-mic').removeClass('speech-mic').addClass('speech-mic-works');
            console.log('starting recognition')
            $('.cover > i').toggleClass('recording');
            textArea.focus();
            recognition.start();
        };

        recognition.onresult = function (event) {
            console.log('result')
            var pos = textArea.getCursorPosition() - interimResult.length;
            textArea.val(textArea.val().replace(interimResult, ''));
            interimResult = '';
            textArea.setCursorPosition(pos);
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    insertAtCaret(textAreaID, event.results[i][0].transcript);
                } else {
                    isFinished = false;
                    insertAtCaret(textAreaID, event.results[i][0].transcript + '\u200B');
                    interimResult += event.results[i][0].transcript + '\u200B';
                }
            }
        };

        recognition.onend = function() {
            //$('.speech-content-mic').removeClass('speech-mic-works').addClass('speech-mic');
            $('.microphone').removeClass('recording').addClass('not-recording')
        };
    });
})(jQuery);