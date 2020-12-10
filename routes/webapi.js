var express = require('express');
var router = express.Router();
var request = require('request');


router.get('/get/places', function (req, res) {
    
    var lat = req.query.lat;
    var lng = req.query.lng;
    var zoom = req.query.zoom;
    var place_code = req.query.place_code;

    if (zoom > 8 || zoom < 0) {
        res.json({ status: 'ERR_WRONG_ZOOM' });
        return;
    }

    var dist = f.getDistance(zoom) * 10;

    var query = "";

    query += "SELECT *, ST_DISTANCE_SPHERE(POINT("+lng+", "+lat+"), p_location) AS dist";
    query += " FROM t_places WHERE MBRCONTAINS(ST_LINESTRINGFROMTEXT(";
    query += "CONCAT('LINESTRING(', "+lng+" -  IF("+lng+" < 0, 1, -1) * ";
    query += dist + " / 2 / ST_DISTANCE_SPHERE(POINT("+lng+", "+lat+"), POINT("+lng+" + IF("+lng+" < 0, 1, -1), "+lat+"))";
    query += ", ' ', "+lat+" -  IF("+lng+" < 0, 1, -1) * ";
    query += dist + " / 2 / ST_DISTANCE_SPHERE(POINT("+lng+", "+lat+"), POINT("+lng+", "+lat+" + IF("+lat+" < 0, 1, -1)))";
    query += ", ',', "+lng+" +  IF("+lng+" < 0, 1, -1) * ";
    query += dist + " / 2 / ST_DISTANCE_SPHERE(POINT("+lng+", "+lat+"), POINT("+lng+" + IF("+lng+" < 0, 1, -1), "+lat+"))";
    query += ", ' ', "+lat+" +  IF("+lng+" < 0, 1, -1) * ";
    query += dist + " / 2 / ST_DISTANCE_SPHERE(POINT("+lng+", "+lat+"), POINT("+lng+", "+lat+" + IF("+lat+" < 0, 1, -1)))";
    query += ", ')')";
    query += "), p_location) AND";


    // 가볼만한곳 CT1 AT4 [ATR]
    // 마트 MT1 [MRT]
    // 숙박 AD5 [ACM]
    // 음식점 FD6 [RST]
    // 카페 CE7 [CAF]
    if (place_code == 'ATR') {
        query += " (p_cate_group_code LIKE 'CT1' OR p_cate_group_code LIKE 'AT4')";
    } else if (place_code == 'MRT') {
        query += " p_cate_group_code LIKE 'MT1'";
    } else if (place_code == 'ACM') {
        query += " p_cate_group_code LIKE 'AD5'";
    } else if (place_code == 'RST') {
        query += " p_cate_group_code LIKE 'FD6'";
    } else if (place_code == 'CAF') {
        query += " p_cate_group_code LIKE 'CE7'";
    } else {
        res.json({ status: 'ERR_NO_PLACE_CODE' });
        return;
    }
    query += " ORDER BY dist";

    var params = [];
    
    o.mysql.query(query, params, function(error, result) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL' });
            return;
        }

        res.json({status: 'OK', result: result });
    });
});


router.get('/get/kakao/places', function (req, res) {
    var keyword = req.query.keyword;
    var page = req.query.page;

    if (f.isNone(keyword)) {
        res.json({ status: 'ERR_WRONG_KEYWORD' });
        return;
    }

    if (f.isNone(page)) page = 1;

    request.get({
        uri: 'https://dapi.kakao.com/v2/local/search/keyword.json?query=' + encodeURI(keyword) + '&page=' + page,
        headers: {
            Authorization: 'KakaoAK c3cc426e36dba5cd8dc4275cd6532bf0'
        }
    }, function(error, response) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_KAKAO_PLACE' });
            return;
        }

        var result = JSON.parse(response.body);
        var isEnd = result.meta.is_end;
        var placeList = result.documents;

        res.json({ status: 'OK', result: { isEnd: isEnd, placeList: placeList } });
    });
});


router.post('/add/place/from/user/search', function (req, res) {
    var placeString = req.body.place_string;

    if (f.isNone(placeString)) {
        res.json({ status: 'ERR_WRONG_PLACE_STRING' });
        return;
    }
    
    var place = JSON.parse(placeString);

    console.log(place);

    var query = "SELECT * FROM t_places WHERE p_kp_id = ?";
    var params = [place.id];
    
    o.mysql.query(query, params, function(error, result) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL' });
            return;
        }

        // 먼저 가져온 place가 저장 되어있는지부터 확인
        if (result.length > 0) {
            res.json({ status: 'OK', result: result[0] });

        } else {
            // 처음 보는 place면 저장
            query = "INSERT INTO t_places";
            query += " (p_kp_id, p_name, p_cate_group_code, p_cate_group_name, p_cate_name, p_address,";
            query += " p_road_address, p_phone, p_latitude, p_longitude, p_kp_url, p_location) VALUES";
            query += " (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, POINT(" + place.x + ", " + place.y + "))";
            params = [
                place.id, place.place_name, place.category_group_code, place.category_group_name,
                place.category_name, place.address_name, place.road_address_name, place.phone,
                place.y, place.x, place.place_url
            ];
            o.mysql.query(query, params, function(error, result) {
                if (error) {
                    console.log(error);
                    res.json({ status: 'ERR_MYSQL' });
                    return;
                }

                query = "SELECT * FROM t_places WHERE p_kp_id = ?";
                params = [place.id];
                o.mysql.query(query, params, function(error, result) {
                    if (error) {
                        console.log(error);
                        res.json({ status: 'ERR_MYSQL' });
                        return;
                    }
    
                    res.json({ status: 'OK', result: result[0] });
                });
            });
        }

    });

});


module.exports = router;
