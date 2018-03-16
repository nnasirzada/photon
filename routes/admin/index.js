const express = require('express');
const passport = require('passport');
const router = express.Router();

router.all('/*', (req, res, next) => {
	if (!req.isAuthenticated() || req.user.type != 'admin') {
		res.redirect('/auth/login/');
	}
	req.app.locals.layout = 'admin/layout';
	next();
});

router.get('/', (req, res, next) => {
	res.render('admin/index');
});

router.get('/buildings/', (req, res, next) => {
	res.render('admin/buildings', { active: { buildings: true } });
});

router.get('/student', (req, res, next) => {
	res.render('admin/forms/student', { active: { users: true } })
});

module.exports = router;