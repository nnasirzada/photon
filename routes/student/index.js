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
    res.redirect('./schedule');
});

router.use('/registration', require('./registration'));
router.use('/attendance', require('./attendance'));
router.use('/profile', require('./profile'));
router.use('/schedule', require('./schedule'));

module.exports = router;