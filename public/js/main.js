
var initZoom = 5;
var maxZoom = 8;
var mapMaxZoom = 12;
var kakaoMap = null;
var userGpsMarker = null;
var visiblePlaceList = [];
var isRequestingPlace = false;

$(document).ready(function () {

    var centerLoc = new kakao.maps.LatLng(37.501328, 126.987233);
    var userGpsLastLat = Cookies.get('user_gps_last_lat');
    var userGpsLastLng = Cookies.get('user_gps_last_lng');
    if (userGpsLastLat && userGpsLastLng) {
        centerLoc = new kakao.maps.LatLng(userGpsLastLat, userGpsLastLng);
    }

    kakaoMap = new kakao.maps.Map($('#divKakaoMap').get(0), {
        center: centerLoc,
        level: initZoom,
        maxLevel: mapMaxZoom // max place level <= 9
    });

    if (navigator.geolocation) {
        alert('geolocation 가능함');
        setUserGps(false, true);
    } else {
        userGpsMarker = new kakao.maps.CustomOverlay({
            map: kakaoMap,
            position: centerLoc,
            content: '<div class="gps-marker"><div></div></div>'
        });
        getPlaces(userGpsLastLat, userGpsLastLng, initZoom);
    }

    $('#divGps').click(function() {
        $(this).addClass('selected');
        if (navigator.geolocation) {
            setUserGps(true, false);
        }
    });

    $('#divRefresh').click(function() {
        var zoom = kakaoMap.getLevel();
        if (zoom > maxZoom) {
            alert('지도를 더 확대해주세요.');
            return;
        }

        var centerLoc = kakaoMap.getCenter();
        getPlaces(centerLoc.getLat(), centerLoc.getLng(), zoom);
    });

    $('.kakao-map-place-code-list .place-code p').click(function() {
        var zoom = kakaoMap.getLevel();
        if (zoom > maxZoom) {
            alert('지도를 더 확대해주세요.');
            return;
        }

        $('.kakao-map-place-code-list .place-code p.selected').removeClass('selected');
        $(this).addClass('selected');

        var centerLoc = kakaoMap.getCenter();
        getPlaces(centerLoc.getLat(), centerLoc.getLng(), zoom);
    });

    // 리스트 열기
    $('#divShowPlaceList').click(function() {
        $('#divKakaoMap').height('calc(100% - 320px)');
        kakaoMap.relayout();
        $('.kakao-map-button.refresh').addClass('up');
        $('.kakao-map-place-code-list').addClass('up');
        $(this).hide();
        $('#divPlaceListWrapper').show();
    });

    // 리스트 닫기
    $('#divPlaceListClose').click(function() {
        $('#divKakaoMap').height('100%');
        kakaoMap.relayout();
        $('.kakao-map-button.refresh').removeClass('up');
        $('.kakao-map-place-code-list').removeClass('up');
        $('#divShowPlaceList').show();
        $('#divPlaceListWrapper').hide();
        $('#divPlaceListMinimize').click();
    });

    // 리스트 크게
    $('#divPlaceListMaximize').click(function() {
        $('#divPlaceListWrapper').addClass('maximize');
        $(this).addClass('hide');
        $('#divPlaceListMinimize').removeClass('hide'); // .show() 하면 display: block을 달아버림;
    });

    // 리스트 작게
    $('#divPlaceListMinimize').click(function() {
        $('#divPlaceListWrapper').removeClass('maximize');
        $(this).addClass('hide');
        $('#divPlaceListMaximize').removeClass('hide');
    });

    $('.place-list-wrapper .place-list-body .filters button').click(function() {
        var order = $(this).attr('order');

        alert(order);
    });

    // 마커 클릭 이벤트 (지도 밖의 마커에는 event 안먹어서 이렇게 가는게 맞음)
    $(document).on('click', '.place-marker', function() {
        // 자기 자신 눌렀을 때 (selected 해제)
        if ($(this).hasClass('selected')) {
            $(this).parent().css('z-index', 0);
            $(this).removeClass('selected');
            setPlaceList(visiblePlaceList);
            return;
        }

        // // PlaceList에 해당 place만 세팅하기
        // for (var i = 0; i < visiblePlaceList.length; i++) {
        //     if (visiblePlaceList[i].p_id == $(this).attr('p_id')) {
        //         setPlaceList([visiblePlaceList[i]]);
        //         break;
        //     }
        // }

        // 지도 먼저 이동해서 마커가 보여야 컨트롤 할 수 있음
        $('#divShowPlaceList').click();
        var locPosition = new kakao.maps.LatLng($(this).attr('lat'), $(this).attr('lng'));
        kakaoMap.setCenter(locPosition);

        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');
        $(this).parent().css('z-index', 1);
        $(this).addClass('selected');

        // var place = JSON.parse($($(this).children('input').get(0)).val());
        // console.log(place);

        // 플레이스 리스트 스크롤 세팅
        $('.place-list-wrapper .place-list-body').scrollTop(0); // 스크롤에 따라 position이 가변적임;;
        var position = $('.place-list-wrapper .place-list-body .place-list .place[p_id=' + $(this).attr('p_id') + ']').position();
        $('.place-list-wrapper .place-list-body').scrollTop(position.top - 60);
    });
    // 마커 오버 이벤트 (부모의 z-index를 변경해줘야해서 js 이벤트로 주는거임)
    $(document).on('mouseenter', '.place-marker', function() {
        if ($(this).hasClass('selected')) return;
        $(this).parent().css('z-index', 2);
    });
    $(document).on('mouseleave', '.place-marker', function() {
        if ($(this).hasClass('selected')) return;
        $(this).parent().css('z-index', 0);
    });

    // 리스트에서 지도 아이콘 클릭 (해당 플레이스 selected)
    $(document).on('click', '.place-list-wrapper .place-list-body .place-list .place .header .controls .control', function() {
        // 지도 먼저 이동해서 마커가 보여야 컨트롤 할 수 있음
        $('#divPlaceListMinimize').click();
        var locPosition = new kakao.maps.LatLng($(this).attr('lat'), $(this).attr('lng'));
        kakaoMap.setCenter(locPosition);

        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');
        $('.place-marker[p_id=' + $(this).attr('p_id') + ']').parent().css('z-index', 1);
        $('.place-marker[p_id=' + $(this).attr('p_id') + ']').addClass('selected');

        // 플레이스 리스트 스크롤 세팅
        $('.place-list-wrapper .place-list-body').scrollTop(0); // 스크롤에 따라 position이 가변적임;;
        var position = $('.place-list-wrapper .place-list-body .place-list .place[p_id=' + $(this).attr('p_id') + ']').position();
        $('.place-list-wrapper .place-list-body').scrollTop(position.top - 60);
    });

});


function setUserGps(isMoveMap, isGetPlaces) {
    navigator.geolocation.getCurrentPosition(function(position) {
        if (userGpsMarker) {
            userGpsMarker.setMap(null);
            userGpsMarker = null;
        }

        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        var locPosition = new kakao.maps.LatLng(lat, lng);
        userGpsMarker = new kakao.maps.CustomOverlay({
            map: kakaoMap,
            position: locPosition,
            content: '<div class="gps-marker"><div></div></div>'
        });
        Cookies.set("user_gps_last_lat", lat);
        Cookies.set("user_gps_last_lng", lng);

        if (isMoveMap) {
            kakaoMap.setCenter(locPosition);
            kakaoMap.setLevel(initZoom);
        }
        if (isGetPlaces) {
            var zoom = kakaoMap.getLevel();
            if (zoom > maxZoom) return;
            getPlaces(lat, lng, zoom);
        }
        $('#divGps').removeClass('selected');
    });
}


function getPlaces(lat, lng, zoom) {
    if (isRequestingPlace) return;
    isRequestingPlace = true;

    createOverlay();
    createSpinner();

    var place_code = $('.kakao-map-place-code-list .place-code p.selected').attr('place_code');

    $.get(
        '/webapi/get/places',
        { search_type: 'DIST', lat: lat, lng: lng, zoom: zoom, place_code: place_code },
        function(response) {
            removeAllVisiblePlaces();

            if (response.status != 'OK') {
                alert('에러가 발생했습니다.');
                removeOverlay();
                removeSpinner();
                return;
            }

            var placeList = response.result;

            for (var i = 0; i < placeList.length; i++) {
                var place = placeList[i];

                // Set Marker
                var markerPosition  = new kakao.maps.LatLng(place.p_latitude, place.p_longitude);

                var markerContentHtml = '';
                markerContentHtml += '<div class="place-marker" p_id="' + place.p_id + '" name="' + place.p_name + '" lat="' + place.p_latitude + '" lng="' + place.p_longitude + '">';
                // markerContentHtml += '<input type="hidden" value="' + JSON.stringify(place).replace(/\"/gi, "&quot;") + '" />';

                if (place_code == 'ATR') {
                    markerContentHtml += '<i class="fas fa-monument"></i>';
                } else if (place_code == 'MRT') {
                    markerContentHtml += '<i class="fas fa-shopping-basket"></i>';
                } else if (place_code == 'ACM') {
                    markerContentHtml += '<i class="fas fa-bed"></i>';
                } else if (place_code == 'RST') {
                    markerContentHtml += '<i class="fas fa-utensils"></i>';
                } else if (place_code == 'CAF') {
                    markerContentHtml += '<i class="fas fa-coffee"></i>';
                }
                markerContentHtml += '</div>';

                var marker = new kakao.maps.CustomOverlay({
                    map: kakaoMap,
                    position: markerPosition,
                    content: markerContentHtml
                });

                place.marker = marker;
                visiblePlaceList.push(place);
            }
            setPlaceList(visiblePlaceList);

            removeOverlay();
            removeSpinner();
            isRequestingPlace = false;
        },
        'JSON'
    );
}


function setPlaceMarkerClickEvent() {

}


function removeAllVisiblePlaces() {
    for (var i = 0; i < visiblePlaceList.length; i++) {
        var visiblePlace = visiblePlaceList[i];
        visiblePlace.marker.setMap(null);
        visiblePlace.marker = null;
    }
    visiblePlaceList = [];
}


function setPlaceList(placeList) {
    $('#divPlaceList').empty();

    var html = '';
    for (var i = 0; i < placeList.length; i++) {
        var place = placeList[i];

        html += '<div class="place" p_id="' + place.p_id + '">';
            html += '<div class="header">';
                html += '<p class="cate">' + place.p_cate_name + '</p>';
                html += '<p class="name">' + place.p_name + '</p>';
                html += '<div class="social">';
                    html += '<p class="like"><i class="fal fa-heart"></i><span>255</span></p>';
                    html += '<p class="comment"><i class="fal fa-comment"></i><span>144</span></p>';
                html += '</div>';

                html += '<div class="controls">';
                    // 현재 a태그로 이동 후 지도가 날라가는 현상이 있음. 실서버에서 테스트해볼것.
                    html += '<a href="' + place.p_kp_url + '" target="_blank"><div class="control kakao-place"></div></a>';
                    html += '<div class="control location" p_id="' + place.p_id + '" lat="' + place.p_latitude + '" lng="' + place.p_longitude + '"><i class="fas fa-map-marker-alt"></i></div>';
                html += '</div>';
            html += '</div>';
            html += '<div class="images">';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
            html += '</div>';
        html += '</div>';
    }

    $('#divPlaceList').html(html);
}
