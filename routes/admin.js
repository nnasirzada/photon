const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res, next) => {
	if (!req.isAuthenticated() || req.user.type != 'admin')
		return res.redirect('/auth/login/');
	res.render('admin/index', { layout: false });
});

module.exports = router;