$(document).ready(function() {
    $('textarea#speech-page-content').bind('input propertychange', $.debounce(250, do_something));

    function do_something() {
        console.log('doing something');
    };
});