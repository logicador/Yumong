

$(document).ready(function() {

});


function createOverlay() {
    $('body').addClass('overflow-hidden');
    $('body').append('<div class="overlay transparent"></div>');
}
function removeOverlay() {
    $('body').removeClass('overflow-hidden');
    $('.overlay').remove();
}
function createSpinner() {
    $('body').append('<div class="lds-hourglass"></div>');
}
function removeSpinner() {
    $('.lds-hourglass').remove();
}
