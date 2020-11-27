

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


function getPlaceCodeFromPlaceCateGroupCode(placeCateGroupCode) {
    if (placeCateGroupCode == 'CT1' || placeCateGroupCode == 'AT4') {
        return 'ATR';
    } else if (placeCateGroupCode == 'MT1') {
        return 'MRT';
    } else if (placeCateGroupCode == 'AD5') {
        return 'ACM';
    } else if (placeCateGroupCode == 'FD6') {
        return 'RST';
    } else if (placeCateGroupCode == 'CE7') {
        return 'CAF';
    } else {
        return '';
    }
}


function getPlaceCodeIconHtml(placeCode) {
    if (placeCode == 'ATR') {
        return '<i class="fas fa-monument"></i>';
    } else if (placeCode == 'MRT') {
        return '<i class="fas fa-shopping-basket"></i>';
    } else if (placeCode == 'ACM') {
        return '<i class="fas fa-bed"></i>';
    } else if (placeCode == 'RST') {
        return '<i class="fas fa-utensils"></i>';
    } else if (placeCode == 'CAF') {
        return '<i class="fas fa-coffee"></i>';
    } else {
        return '';
    }
}
