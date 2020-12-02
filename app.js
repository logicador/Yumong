var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session') (session);
var moment = require('moment');


require('dotenv').config();

var indexRouter = require('./routes/index');
var webApiRouter = require('./routes/webapi');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'YUMONGSECRET',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    })
}));

app.use('/', indexRouter);
app.use('/webapi', webApiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

global.o = {}; // 객체
global.f = {}; // 함수
global.c = {}; // 상수

// mysql connection
global.o.mysql = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    port: process.env.MYSQL_PORT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    dateStrings: 'date'
});

// none check
global.f.is_none = function(value) {
    if (typeof value == 'undefined' || value == null || value == '') return true;
    return false;
};

// random id
global.f.get_random_id = function() {
    var rand = Math.floor(Math.random() * 9999) + '';
    var pad = rand.length >= 4 ? rand : new Array(4 - rand.length + 1).join('0') + rand;
    var random_id = moment().format("YYMMDDHHmmss") + pad;
    return random_id;
};

// login check
global.f.is_logined = function(session) {
    if (session.u_id && session.u_kakao_id) return true;
    return false;
};

// intcomma
global.f.int_comma = function(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// zoom to distance
global.f.get_distance = function(zoom) {
    if (zoom == 1) return 20;
    else if (zoom == 2) return 30;
    else if (zoom == 3) return 50;
    else if (zoom == 4) return 100;
    else if (zoom == 5) return 250;
    else if (zoom == 6) return 500;
    else if (zoom == 7) return 1000;
    else if (zoom == 8) return 2000;
    else return 0;
};

module.exports = app;
