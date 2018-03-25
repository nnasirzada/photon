const express = require('express');
const router = express.Router();
const models = require('../../models');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) => {
	models.User.findOne({
		where: {
			id: req.user.id
		}
	}).then(User => {
		let data = User.dataValues;
		data.type = data.type.charAt(0).toUpperCase() + data.type.slice(1);

		res.render('instructor/profile', {
			title: 'Profile',
			active: {
				profile: true
			},
			imports: {
				uikit: true,
				uikit_icons: true
			},
			user: data,
			error: req.flash('error'),
			success: req.flash('success')
		});
	})
});

router.post('/', (req, res, next) => {
	req.checkBody('oldpassword', null).notEmpty();
	req.checkBody('newpassword', null).notEmpty().isLength({ min: 8, max: 24 });
	req.checkBody('confirmpassword', null).notEmpty().equals(req.body.newpassword);

	if (req.validationErrors()) {
		throw new Error('Form inputs are not valid.');
	}

	models.User.findOne({
		where: {
			id: req.user.id
		}
	}).then(User => {
		if (!bcrypt.compareSync(req.body.oldpassword, User.password)) {
			throw new Error('Old password is wrong');
		}
		return models.User.update({ password: req.body.newpassword }, { where: { id: req.user.id }, individualHooks: true });
	}).then(result => {
		req.flash('success', 'Password updated');
		res.redirect('/instructor/profile');
	}).catch(err => {
		req.flash('error', err.message);
		res.redirect('/instructor/profile');
	});
});

module.exports = router;