const express = require('express');
const router = express.Router();

router.all('/*', (req, res, next) => {
    if (!req.isAuthenticated() || req.user.type != 'student')
        res.status(403).redirect('/auth/login/');
    req.app.locals.layout = 'student/layout';
    next();
});

router.get('/', (req, res, next) => {
    res.redirect('./schedule');
});

router.use('/schedule/', require('./schedule'));
router.use('/profile', require('./profile'));
router.use('/terms/', require('./terms'));
router.use('/terms/:term_id/attendance/', require('./attendance'));

router.use('/registration', require('./registration'));
router.use('/unofficial-transcript', require('./unofficial-transcript'));

module.exports = router;