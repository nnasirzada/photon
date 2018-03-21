const express = require('express');
const passport = require('passport');
const router = express.Router();

router.all('/*', (req, res, next) => {
	if (!req.isAuthenticated() || req.user.type != 'instructor') {
		res.status(403).redirect('/auth/login/');
	}
	req.app.locals.layout = 'instructor/layout';
	next();
});

router.get('/', (req, res, next) => {
	res.redirect('./schedule');
});

router.use('/classes', require('./classes'));
router.use('/schedule', require('./schedule'));

module.exports = router;