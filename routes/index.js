var express = require('express');
var router = express.Router();


router.get('/login', function(req, res, next) {
    res.render('index', {
        menu: 'login',
        title: '<span class="highlight"><i class="fad fa-plane-alt"></i> 여몽</span> <span class="sub">여행을 꿈꾸다</span>',
    
        isShowBackButton: false
    });
});


router.get('/', function (req, res, next) {
    res.render('index', {
        menu: 'main',
        title: '<span class="highlight"><i class="fad fa-plane-alt"></i> 여몽</span> <span class="sub">여행을 꿈꾸다</span>',
        
        isShowBackButton: false
    });
});


router.get('/search', function (req, res, next) {
    res.render('index', {
        menu: 'search',
        title: '검색',
        
        isShowBackButton: false
    });
});


router.get('/note', function (req, res, next) {
    if (!f.is_logined(req.session)) {
        res.redirect('/login?next=/mypage');
        return;
    }
    
    res.render('index', {
        menu: 'note',
        title: '여행노트',
        
        isShowBackButton: false
    });
});


router.get('/mypage', function (req, res, next) {
    if (!f.is_logined(req.session)) {
        res.redirect('/login?next=/mypage');
        return;
    }

    res.render('index', {
        menu: 'mypage',
        title: '마이페이지',
        
        isShowBackButton: false
    });
});

module.exports = router;
