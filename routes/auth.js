require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const passport = require('passport');
const nodemailer = require('nodemailer');
const models = require('../models');
const router = express.Router();

router.get('/login', isNotLoggedIn, (req, res, next) => {
	res.render('auth/login', {
		layout: false,
		error: req.flash('error'),
		success: req.flash('success'),
		password_reset_requested: req.flash('password_reset_requested')
	});
});

router.post('/login', isNotLoggedIn, passport.authenticate('local.login', {
	successRedirect: '/auth/redirect/',
	failureRedirect: '/auth/login/',
	failureFlash: true
}));

router.get('/reset-password/:token', isNotLoggedIn, (req, res, next) => {
	models.ResetPasswordToken.findOne({ where: { token: req.params.token, used: false } }).then((ResetPasswordToken) => {
		if (!ResetPasswordToken || ResetPasswordToken.expires_at < Date.now()) {
			let err = new Error('Not Found');
			err.status = 404;
			res.locals.error = err;
			res.status(err.status || 500);
			return res.render('error', { title: err.message });
		} else {
			return res.render('auth/reset-password', {
				layout: false,
				error: req.flash('error'),
				token: req.params.token
			});
		}
	});
});

router.post('/reset-password', isNotLoggedIn, (req, res, next) => {

	req.checkBody('token', 'Token is empty.').notEmpty();
	req.checkBody('password', 'Password length should be between 8 and 24.').notEmpty().isLength({ min: 8, max: 24 });
	req.checkBody('re-password', 'Passwords do not match').notEmpty().equals(req.body.password);

	let validationErrors = req.validationErrors();
	if (validationErrors) {
		let errors = [];
		validationErrors.forEach(error => { errors.push(error.msg); });
		req.flash('error', errors);
		return res.redirect('/auth/reset-password/' + req.body.token);
	}

	models.ResetPasswordToken.findOne({ where: { token: req.body.token, used: false } }).then((ResetPasswordToken) => {

		if (!ResetPasswordToken) {
			req.flash('error', 'Token not found or already used.');
			return res.redirect('/auth/reset-password/' + req.body.token);
		}

		if (ResetPasswordToken.expires_at < Date.now()) {
			req.flash('error', 'Token is expired.');
			return res.redirect('/auth/reset-password/' + req.body.token);
		}

		models.User.update(
			{ password: req.body.password },
			{ where: { id: ResetPasswordToken.person_id }, individualHooks: true }

		).then(result => {

			models.ResetPasswordToken.update({ used: true }, { where: { token: ResetPasswordToken.token } });

			req.flash('success', 'Password successfully changed.');
			return res.redirect('/auth/login/');

		}).catch(err => {
			req.flash('error', 'Something went wrong.');
			return res.redirect('/auth/reset-password/' + req.body.token);
		});

	}).catch(err => {
		req.flash('error', 'Something went wrong.');
		return res.redirect('/auth/reset-password/' + req.body.token);
	});
});

router.post('/request-password-reset', isNotLoggedIn, (req, res, next) => {

	req.flash('password_reset_requested', true);

	req.checkBody('email', null).notEmpty().isEmail();

	if (req.validationErrors()) return res.redirect('/auth/login/');

	models.User.findOne({ where: { email: req.body.email } }).then((User) => {

		if (!User) {
			return res.redirect('/auth/login/');
		}

		const token = crypto.randomBytes(16).toString('hex');

		models.ResetPasswordToken.build({
			person_id: User.id,
			token: token

		}).save().then(ResetPasswordToken => {

			let transporter = nodemailer.createTransport({
				host: process.env.EMAIL_HOST,
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: process.env.EMAIL,
					pass: process.env.EMAIL_PASSWORD
				},
				tls: {
					rejectUnauthorized: false
				}
			});

			let mailOptions = {
				from: '"Photon" <' + process.env.EMAIL + '>',
				to: req.body.email,
				subject: 'Reset your password',
				text: 'Click the following link to set a new password: http://shahinmursalov.com/auth/reset-password/' + token,
			};

			transporter.sendMail(mailOptions, (err, info) => {
				if (err) throw err;
			});

		}).catch(err => {
			return res.redirect('/auth/login/');
		});

		return res.redirect('/auth/login/');

	}).catch((err) => {
		return res.redirect('/auth/login/');
	});
});

router.get('/redirect', isLoggedIn, (req, res, next) => {
	switch (req.user.type) {
		case 'admin':
			res.redirect('/admin/');
			break;
		default:
			res.end();
	}
})

router.get('/logout', isLoggedIn, (req, res, next) => {
	req.logout();
	res.redirect('/');
})

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect('/auth/login/');
}

function isNotLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) return next();
	res.redirect('/auth/redirect/');
}