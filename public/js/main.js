var isLoadingGps = false;
var initZoom = 5;
var maxZoom = 8;
var mapMaxZoom = 12;
var kakaoMap = null;
var userGpsMarker = null;
var visiblePlaceList = [];
var isRequestingPlace = false;


// Start document ready
$(document).ready(function () {

    var centerLoc = new kakao.maps.LatLng(37.501328, 126.987233);
    // 저장된 마지막 좌표 불러오기
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

    // 지도 클릭하면 선택된 place marker들 selected 해제
    kakao.maps.event.addListener(kakaoMap, 'click', function(mouseEvent) {
        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');
    });

    // gps 사용 가능하다면
    if (navigator.geolocation) {
        isLoadingGps = true;
        $('#divGps').addClass('selected');
        setUserGps(false, true);
    } else {
        // userGpsMarker = new kakao.maps.CustomOverlay({
        //     map: kakaoMap,
        //     position: centerLoc,
        //     content: '<div class="gps-marker"><div></div></div>'
        // });
        getPlaces(userGpsLastLat, userGpsLastLng, initZoom);
    }

    // gps 버튼 클릭
    $('#divGps').click(function() {
        if (isLoadingGps) return;

        isLoadingGps = true;
        $(this).addClass('selected');
        if (navigator.geolocation) {
            setUserGps(true, false);
        }
    });

    // 새로고침 / 불러오기
    // 현재 지도 중앙 좌표 기준으로 place 호출
    $('#divRefresh').click(function() {
        var zoom = kakaoMap.getLevel();
        if (zoom > maxZoom) {
            alert('지도를 더 확대해주세요.');
            return;
        }

        var centerLoc = kakaoMap.getCenter();
        getPlaces(centerLoc.getLat(), centerLoc.getLng(), zoom);
    });

    // 숙박, 마트, 카페, 음식점, 가볼만한곳 클릭 이벤트
    $('section.main .kakao-map-place-code-list .place-code p').click(function() {
        var zoom = kakaoMap.getLevel();
        if (zoom > maxZoom) {
            alert('지도를 더 확대해주세요.');
            return;
        }

        $('section.main .kakao-map-place-code-list .place-code p.selected').removeClass('selected');
        $(this).addClass('selected');

        var centerLoc = kakaoMap.getCenter();
        getPlaces(centerLoc.getLat(), centerLoc.getLng(), zoom);
    });

    // 리스트 열기
    $('#divShowPlaceList').click(function() {
        // 리스트 기본높이 360px
        $('#divKakaoMap').height('calc(100% - 360px)');
        // 카카오지도 크기 변경하면 반드시 호출할 것
        kakaoMap.relayout();
        // place code들 위로 올려줘야됨
        $('section.main .kakao-map-place-code-list').addClass('up');
        $(this).hide();
        // 리스트뷰 show
        $('#divPlaceListWrapper').show();
    });

    // 리스트 닫기
    $('#divPlaceListClose').click(function() {
        // 지도 크기 원복
        $('#divKakaoMap').height('100%');
        kakaoMap.relayout();
        $('section.main .kakao-map-place-code-list').removeClass('up');
        // 목록보기 버튼 다시 보이게
        $('#divShowPlaceList').show();
        // 최대화 해제 먼저 하고
        $('#divPlaceListMinimize').click();
        // 리스트뷰 hide
        $('#divPlaceListWrapper').hide();
    });

    // 리스트 최대화
    $('#divPlaceListMaximize').click(function() {
        $('#divPlaceListWrapper').addClass('maximize');
        $(this).addClass('hide');
        // hide 클래스를 따로 준 이유: show() 하면 지 멋대로 display: block을 달아버림;
        $('#divPlaceListMinimize').removeClass('hide');
    });

    // 리스트 작게
    $('#divPlaceListMinimize').click(function() {
        $('#divPlaceListWrapper').removeClass('maximize');
        $(this).addClass('hide');
        $('#divPlaceListMaximize').removeClass('hide');
    });

    // 리스트뷰 정렬순서 버튼
    $('section.main .place-list-wrapper .place-list-body .filters button').click(function() {
        var order = $(this).attr('order');

        alert(order);
    });

    // 마커 클릭 이벤트 (지도 밖의 마커에는 event 안먹어서 이렇게 가는게 맞음)
    $(document).on('click', '.place-marker', function() {
        // 자기 자신 눌렀을 때 (selected 해제)
        // if ($(this).hasClass('selected')) {
        //     $(this).parent().css('z-index', 0);
        //     $(this).removeClass('selected');
        //     setPlaceList(visiblePlaceList);
        //     return;
        // }

        // // PlaceList에 해당 place만 세팅하기
        // for (var i = 0; i < visiblePlaceList.length; i++) {
        //     if (visiblePlaceList[i].p_id == $(this).attr('p_id')) {
        //         setPlaceList([visiblePlaceList[i]]);
        //         break;
        //     }
        // }

        // 지도 이동 전에 한번 지워주고
        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');

        $('#divShowPlaceList').click();
        // 지도 중앙 이동 기능 중지
        // 지도 먼저 이동해서 마커가 보여야 컨트롤 할 수 있음
        // var locPosition = new kakao.maps.LatLng($(this).attr('lat'), $(this).attr('lng'));
        // kakaoMap.setCenter(locPosition);

        // // 지도 이동 후에도 한번 지워줌
        // $('.place-marker.selected').parent().css('z-index', 0);
        // $('.place-marker.selected').removeClass('selected');

        $(this).parent().css('z-index', 1);
        $(this).addClass('selected');

        // 플레이스 리스트 스크롤 세팅
        $('section.main .place-list-wrapper .place-list-body').scrollTop(0); // 스크롤에 따라 position이 가변적임;;
        var position = $('section.main .place-list-wrapper .place-list-body .place-list .place[p_id=' + $(this).attr('p_id') + ']').position();
        $('section.main .place-list-wrapper .place-list-body').scrollTop(position.top - (56 + 41 - 20 - 10));
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
    $(document).on('click', 'section.main .place-list-wrapper .place-list-body .place-list .place .controls .control', function() {

        // 지도 이동 전에 한번 지워주고
        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');

        // 지도 먼저 이동해서 마커가 보여야 컨트롤 할 수 있음
        $('#divPlaceListMinimize').click();
        var locPosition = new kakao.maps.LatLng($(this).attr('lat'), $(this).attr('lng'));
        kakaoMap.setCenter(locPosition);

        // 지도 이동 후에도 한번 지워줌
        $('.place-marker.selected').parent().css('z-index', 0);
        $('.place-marker.selected').removeClass('selected');

        $('.place-marker[p_id=' + $(this).attr('p_id') + ']').parent().css('z-index', 1);
        $('.place-marker[p_id=' + $(this).attr('p_id') + ']').addClass('selected');

        // 플레이스 리스트 스크롤 세팅
        $('section.main .place-list-wrapper .place-list-body').scrollTop(0); // 스크롤에 따라 position이 가변적임;;
        var position = $('section.main .place-list-wrapper .place-list-body .place-list .place[p_id=' + $(this).attr('p_id') + ']').position();
        $('section.main .place-list-wrapper .place-list-body').scrollTop(position.top - (56 + 41 - 20 - 10));
    });

    $('#divOpenPlaceSearchDialog').click(function() {
        createOverlay('dark', 'DIALOG_PLACE_SEARCH');
        var html = '';
        html += '<div class="dialog-place-search">';
            html += '<div class="header">';
                html += '<div class="header-wrapper">';
                    html += '<p class="title">장소 검색하기</p>';
                    html += '<div class="close"><i class="fal fa-times"></i></div>';
                html += '</div>';
            html += '</div>';
            html += '<input type="text" placeholder="검색어를 입력해주세요." />';
            html += '<div class="search-place-list"></div>';
        html += '</div>';
        $('body').append(html);

        var timerList = [];
        var keyword = '';
        var req_keyword = '';
        var page = 1;
        var isEndOfPlaceList = false;
        var isScrollLoading = false;

        var clearDialogSearchPlaceList = function() {
            page = 1;
            isEndOfPlaceList = false;
            $('.dialog-place-search .search-place-list').empty();
        };

        var callbackAfterResponse = function(response) {
            if (response.status != 'OK') {
                alert('에러가 발생했습니다.\n\n[' + response.status + ']');
                removeOverlay('GET_DIALOG_PLACE_SEARCH');
                removeSpinner('GET_DIALOG_PLACE_SEARCH');
                return;
            }

            var isEnd = response.result.isEnd;
            var placeList = response.result.placeList;

            if (isEnd) isEndOfPlaceList = true;

            var html = '';
            for (var i = 0; i < placeList.length; i++) {
                var place = placeList[i];

                html += '<div class="place">';
                    html += '<input type="hidden" value="' + JSON.stringify(place).replace(/\"/gi, "&quot;") + '" />';
                    html += '<div class="place-wrapper">';
                        html += '<p class="cate-group-name">' + ((place.category_group_name) ? place.category_group_name : '&nbsp;') + '</p>';
                        html += '<p class="cate-name">' + place.category_name + '</p>';
                        html += '<p class="name">' + place.place_name + '</p>';
                        html += '<p class="address">' + ((place.road_address_name) ? place.road_address_name : place.address_name) + '</p>';
                    html += '</div>';
                html += '</div>';
            }

            $('.dialog-place-search .search-place-list').append(html);

            removeOverlay('GET_DIALOG_PLACE_SEARCH');
            removeSpinner('GET_DIALOG_PLACE_SEARCH');
        };

        // 키를 누를때 타이머들 다 죽이면서 초기화
        $('.dialog-place-search input').keydown(function() {
            for (var i = 0; i < timerList.length; i++) { clearTimeout(timerList[i]); }
            clearDialogSearchPlaceList();
        });

        // 키를 땔때 timer 0.25초 돌리면서 이후
        $('.dialog-place-search input').keyup(function() {
            // 입력값이 키워드랑 똑같고 page가 1이면 중복쿼리로 간주
            // timer가 0.25초인데 그 안에 입력해버리면 발생함.
            if ($(this).val() == keyword && page == 1) return;

            keyword = $(this).val();
            if (keyword.length < 1) {
                $('.dialog-place-search .search-place-list').empty();
                return;
            }

            clearDialogSearchPlaceList();

            // 입력 후 0.25초 후에 실행시키기 위함
            var timer = setTimeout(function() {
                clearDialogSearchPlaceList();

                createOverlay('transparent', 'GET_DIALOG_PLACE_SEARCH');
                createSpinner('GET_DIALOG_PLACE_SEARCH');
                $.get(
                    '/webapi/get/kakao/places',
                    { keyword: keyword, page: page },
                    function(response) {
                        callbackAfterResponse(response);
                    },
                    'json'
                );

            }, 250);
            timerList.push(timer);
        });

        // 인피니티 스크롤 이벤트
        $('.dialog-place-search .search-place-list').scroll(function() {
            if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight - 20) {
                if (isEndOfPlaceList) return;
                if (isScrollLoading) return;

                isScrollLoading = true;

                page++;

                createOverlay('transparent', 'GET_DIALOG_PLACE_SEARCH');
                createSpinner('GET_DIALOG_PLACE_SEARCH');
                $.get(
                    '/webapi/get/kakao/places',
                    { keyword: keyword, page: page },
                    function(response) {
                        callbackAfterResponse(response);
                        isScrollLoading = false;
                    },
                    'json'
                );
            }
        });
    });

    $(document).on('click', '.dialog-place-search .header .close', function() {
        $('.dialog-place-search').remove();
        removeOverlay('DIALOG_PLACE_SEARCH');
    });

    $(document).on('click', '.dialog-place-search .search-place-list .place', function() {
        var placeString = $($(this).children('input').get(0)).val();
        // var place = JSON.parse($($(this).children('input').get(0)).val());

        createOverlay('transparent', 'SELECT_DIALOG_PLACE_SEARCH');
        createSpinner('SELECT_DIALOG_PLACE_SEARCH');
        $.post(
            '/webapi/add/place/from/user/search',
            { place_string: placeString },
            function(response) {
                if (response.status != 'OK') {
                    alert('에러가 발생했습니다.');
                    removeOverlay('SELECT_DIALOG_PLACE_SEARCH');
                    removeSpinner('SELECT_DIALOG_PLACE_SEARCH');
                    return;
                }

                // 기존 플레이스들 싹 없애주고
                removeAllVisiblePlaces();

                var place = response.result;
                var placeCode = getPlaceCodeFromPlaceCateGroupCode(place.p_cate_group_code);

                // placeCode로 숙박/마트/카페/음식점/가볼만한곳 세팅
                if (placeCode) {
                    $('section.main .kakao-map-place-code-list .place-code p.selected').removeClass('selected');
                    $('section.main .kakao-map-place-code-list .place-code p[place_code=' + placeCode + ']').addClass('selected');
                }
                
                // 마커 세팅
                var markerPosition  = new kakao.maps.LatLng(place.p_latitude, place.p_longitude);
                var markerContentHtml = '';
                markerContentHtml += '<div class="place-marker" p_id="' + place.p_id + '" name="' + place.p_name + '" lat="' + place.p_latitude + '" lng="' + place.p_longitude + '">';
                markerContentHtml += getPlaceCodeIconHtml(placeCode);
                markerContentHtml += '</div>';
                var marker = new kakao.maps.CustomOverlay({
                    map: kakaoMap,
                    position: markerPosition,
                    content: markerContentHtml
                });

                place.marker = marker;
                visiblePlaceList.push(place);
                setPlaceList(visiblePlaceList);

                $('#divShowPlaceList').click();

                // 플레이스로 지도 이동
                var locPosition = new kakao.maps.LatLng(place.p_latitude, place.p_longitude);
                kakaoMap.setCenter(locPosition);

                // 마커 선택 select
                $('.place-marker[p_id=' + place.p_id + ']').parent().css('z-index', 1);
                $('.place-marker[p_id=' + place.p_id + ']').addClass('selected');

                removeOverlay('SELECT_DIALOG_PLACE_SEARCH');
                removeSpinner('SELECT_DIALOG_PLACE_SEARCH');
                removeOverlay('DIALOG_PLACE_SEARCH');
                $('.dialog-place-search').remove();
            },
            'json'
        );
    });

});
// End document ready


// 사용자 gps 활성화
function setUserGps(isMoveMap, isGetPlaces) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
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
            // 쿠키에 저장해둠
            Cookies.set("user_gps_last_lat", lat);
            Cookies.set("user_gps_last_lng", lng);

            // 해당 좌표로 지도 이동하는지 여부
            if (isMoveMap) {
                kakaoMap.setCenter(locPosition);
                kakaoMap.setLevel(initZoom);
            }
            // 바로 place들 호출하는지 여부
            if (isGetPlaces) {
                var zoom = kakaoMap.getLevel();
                if (zoom > maxZoom) return;
                getPlaces(lat, lng, zoom);
            }
            isLoadingGps = false;
            $('#divGps').removeClass('selected');
        },
        function() { // 에러, 현재 지도 중심 기준으로 place 호출
            var zoom = kakaoMap.getLevel();
            if (zoom > maxZoom) { return; }

            var centerLoc = kakaoMap.getCenter();
            getPlaces(centerLoc.getLat(), centerLoc.getLng(), zoom);
            isLoadingGps = false;
            $('#divGps').removeClass('selected');
        }
    );
}


function getPlaces(lat, lng, zoom) {

    // 재호출 막기
    if (isRequestingPlace) return;
    isRequestingPlace = true;

    createOverlay('transparent', 'GET_PLACES');
    createSpinner('GET_PLACES');

    var placeCode = $('section.main .kakao-map-place-code-list .place-code p.selected').attr('place_code');
    $.get(
        '/webapi/get/places',
        { search_type: 'DIST', lat: lat, lng: lng, zoom: zoom, place_code: placeCode },
        function(response) {
            removeAllVisiblePlaces();

            if (response.status != 'OK') {
                alert('에러가 발생했습니다.');
                removeOverlay('GET_PLACES');
                removeSpinner('GET_PLACES');
                return;
            }

            var placeList = response.result;

            for (var i = 0; i < placeList.length; i++) {
                var place = placeList[i];

                // 마커 세팅
                var markerPosition  = new kakao.maps.LatLng(place.p_latitude, place.p_longitude);
                var markerContentHtml = '';
                markerContentHtml += '<div class="place-marker" p_id="' + place.p_id + '" name="' + place.p_name + '" lat="' + place.p_latitude + '" lng="' + place.p_longitude + '">';
                markerContentHtml += getPlaceCodeIconHtml(getPlaceCodeFromPlaceCateGroupCode(place.p_cate_group_code));
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

            removeOverlay('GET_PLACES');
            removeSpinner('GET_PLACES');
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


// 하단 place 목록 뷰 세팅
function setPlaceList(placeList) {
    $('#divPlaceList').empty();

    var html = '';
    for (var i = 0; i < placeList.length; i++) {
        var place = placeList[i];

        html += '<div class="place" p_id="' + place.p_id + '">';
            html += '<div class="controls">';
                // 현재 a태그로 이동 후 지도가 날라가는 현상이 있음. 실서버에서 테스트해볼것.
                // 확인 결과 지도 날라감... iframe으로 변경해야될듯?
                html += '<a href="' + place.p_kp_url + '" target="_blank"><div class="control kakao-place"></div></a>';
                html += '<div class="control location" p_id="' + place.p_id + '" lat="' + place.p_latitude + '" lng="' + place.p_longitude + '"><i class="fas fa-map-marker-alt"></i></div>';
            html += '</div>';
            html += '<p class="cates">' + ((place.p_cate_group_name) ? '<span class="highlight">' + place.p_cate_group_name + '</span>' : '') + place.p_cate_name + '</p>';
            html += '<p class="name">' + place.p_name + '</p>';
            html += '<p class="address">' + ((place.p_road_address) ? place.p_road_address : place.p_address) + '</p>';
            html += '<div class="social">';
                html += '<p class="like"><i class="fal fa-heart"></i><span>' + intComma(place.p_like_count) + '</span></p>';
                html += '<p class="comment"><i class="fal fa-comment"></i><span>' + intComma(place.p_comment_count) + '</span></p>';
            html += '</div>';
            html += '<div class="images">';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
                html += '<div class="image" style="background-image: url(/img/sample_iu.jpg);"></div>';
            html += '</div>';
        html += '</div>';
    }

    $('#divPlaceList').html(html);
}
