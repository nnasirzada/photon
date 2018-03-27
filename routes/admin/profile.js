const express = require('express');
const models = require('../../models');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/', (req, res, next) => {

	models.User.findOne({
		where: {
			id: req.user.id
		}
	}).then(User => {

		let data = User.dataValues;
		data.type = data.type.charAt(0).toUpperCase() + data.type.slice(1);

		res.render('admin/profile', {
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

	req.checkBody('old_password', 'Old password is empty.').notEmpty();
	req.checkBody('new_password', 'New password length should be between 8 and 24').notEmpty().isLength({ min: 8, max: 24 });
	req.checkBody('confirm_new_password', 'Passwords do not match.').notEmpty().equals(req.body.new_password);

	if (req.validationErrors()) {
		req.flash('error', req.validationErrors()[0].msg);
		res.redirect('/admin/profile/');
	}

	models.User.findOne({
		where: {
			id: req.user.id
		}
	}).then(User => {
		if (!bcrypt.compareSync(req.body.old_password, User.password))
			throw new Error('Old password is wrong.');
		return models.User.update(
			{ password: req.body.new_password },
			{ where: { id: req.user.id }, individualHooks: true });
	}).then(result => {
		req.flash('success', 'Password successfully updated.');
		res.redirect('/admin/profile/');
	}).catch(err => {
		req.flash('error', err.message);
		res.redirect('/admin/profile/');
	});
});

module.exports = router;