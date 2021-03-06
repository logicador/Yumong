var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;


router.get('/', function (req, res) {
    if (!req.session.isAdmin) {
        res.redirect('/admin/login');
        return;
    }

    res.render('admin/index', {
        menu: 'main',

        isAdmin: req.session.isAdmin
    });
});


router.get('/login', function(req, res) {
    res.render('admin/index', {
        menu: 'login',
        
        isAdmin: req.session.isAdmin
    });
});


router.get('/place', function (req, res) {
    if (!req.session.isAdmin) {
        res.redirect('/admin/login');
        return;
    }

    res.render('admin/index', {
        menu: 'place',
        
        isAdmin: req.session.isAdmin
    });
});


router.get('/crawler', function (req, res) {
    if (!req.session.isAdmin) {
        res.redirect('/admin/login');
        return;
    }

    res.render('admin/index', {
        menu: 'crawler',
        
        isAdmin: req.session.isAdmin
    });
});


router.post('/webapi/start/crawling', function(req, res) {
    if (!req.session.isAdmin) {
        res.json({ status: 'ERR_PERMISSION' });
        return;
    }

    let cPNId = req.body.cPNId;
    if (f.isNone(cPNId)) {
        res.json({ status: 'ERR_WRONG_PARAMS' });
        return;
    }

    if (cPNId.indexOf('naver.com') != -1) {
        let find = /\/.+?\?/g.exec(cPNId);
        let reversed = [];
        if (find) find = find[0];
        for (let i = find.length - 2; i > 0; i--) {
            let n = find[i];
            if (n == '/') break;
            reversed.push(n);
        }
        cPNId = reversed.reverse().join('');
    }

    let query = "INSERT INTO t_crawlers (c_p_n_id) VALUES (?)";
    let params = [cPNId];
    o.mysql.query(query, params, function(error, result) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL' });
            return;
        }

        // for windows 10 hp probook
        let command = 'python ' + process.env.DIR + '/python/naver.py';
        exec(command + ' ' + result.insertId, function(error, stdout, stderr) {
            if (error) {
                console.log(error);
                console.log('stderr', stderr);
                return;
            }
        });
    
        // res.json({ status: 'OK', cId: result.insertId });
        res.json({ status: 'OK' });
    });
});


router.get('/webapi/get/crawlers', function(req, res) {
    if (!req.session.isAdmin) {
        res.json({ status: 'ERR_PERMISSION' });
        return;
    }

    let cStatus = req.query.cStatus;
    if (f.isNone(cStatus) || (cStatus != 'RUNNING' && cStatus != 'DUPLICATED' && cStatus != 'FINISHED' && cStatus != 'ERROR' && cStatus != 'NO_PLACE' && cStatus != 'ALL')) {
        res.json({ status: 'ERR_WRONG_PARAMS' });
        return;
    }

    let query = "SELECT * FROM t_crawlers";
    if (cStatus != 'ALL') { query += " WHERE c_status = ?"; }
    query += " ORDER BY c_id DESC ";

    let params = [cStatus];
    o.mysql.query(query, params, function(error, result) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL' });
            return;
        }

        res.json({ status: 'OK', result: result });
    });
});


router.post('/webapi/get/crawler/progress', function(req, res) {
    if (!req.session.isAdmin) {
        res.json({ status: 'ERR_PERMISSION' });
        return;
    }

    let cIdList = req.body.cIdList;
    if (f.isNone(cIdList)) {
        res.json({ status: 'ERR_WRONG_PARAMS' });
        return;
    }

    if (cIdList.length == 0) {
        res.json({ status: 'OK', result: [] });
        return;
    }

    let query = "SELECT * FROM t_crawlers";
    let params = [];
    for (let i = 0; i < cIdList.length; i++) {
        let cId = cIdList[i];
        if (i == 0) query += " WHERE c_id = ?";
        else query += " OR c_id = ?";
        params.push(cId);
    }

    o.mysql.query(query, params, function(error, result) {
        if (error) {
            console.log(error);
            res.json({ status: 'ERR_MYSQL' });
            return;
        }

        res.json({ status: 'OK', result: result });
    });

});


router.post('/webapi/login', (req, res) => {
    let id = req.body.id;
    let password = req.body.password;

    if (id === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.save(function() {
            res.json({ status: 'OK' });
        });
    } else {
        res.json({ status: 'ERR_FAILED_LOGIN' });
    }
});


router.post('/webapi/logout', (req, res) => {
    req.session.isAdmin = false;
    req.session.save(function() {
        res.json({ status: 'OK' });
    });
});


module.exports = router;
