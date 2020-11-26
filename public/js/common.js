

$(document).ready(function() {

});


function intComma(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function createOverlay(background, key) {
    // $('body').addClass('overflow-hidden');
    $('body').append('<div class="overlay ' + background + '" key="' + key + '"></div>');
}
function removeOverlay(key) {
    // $('body').removeClass('overflow-hidden');
    $('.overlay[key=' + key + ']').remove();
}
function createSpinner(key) {
    $('body').append('<div class="lds-hourglass" key="' + key + '"></div>');
}
function removeSpinner(key) {
    $('.lds-hourglass[key=' + key + ']').remove();
}
