var express = require('express');
var router = express.Router();


router.get('/get/places', function (req, res) {
    
    var lat = req.query.lat;
    var lng = req.query.lng;
    var zoom = req.query.zoom;
    var place_code = req.query.place_code;

    if (zoom > 8 || zoom < 0) {
        res.json({ status: 'ERR_WRONG_ZOOM' });
        return;
    }

    var dist = f.get_distance(zoom) * 10;

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


module.exports = router;
