const express = require('express');
const passport = require('passport');
const router = express.Router();

router.all('/*', (req, res, next) => {
	if (!req.isAuthenticated() || req.user.type != 'instructor') {
		res.redirect('/auth/login/');
	}
	req.app.locals.layout = 'instructor/layout';
	next();
});

router.get('/', (req, res, next) => {
	res.render('instructor/index', { title: 'Home - Instructor Dashboard', email: req.user.email });
});

router.use('/classes', require('./classes'));

module.exports = router;