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

module.exports = router;