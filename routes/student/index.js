const express = require('express');
const router = express.Router();

router.all('/*', (req, res, next) => {
    if (!req.isAuthenticated() || req.user.type != 'student') {
        res.status(403).redirect('/auth/login/');
    }
    req.app.locals.layout = 'student/layout';
    next();
});

router.get('/', (req, res, next) => {
    res.render('student/index', {
        title: 'Home',
        active: {
            home: true
        },
        imports: {
            uikit: true
        }
    });
});

router.use('/registration', require('./registration'));
router.use('/attendance', require('./attendance'));

module.exports = router;