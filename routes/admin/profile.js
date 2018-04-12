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

		let values = User.dataValues;
		values.type = values.type.charAt(0).toUpperCase() + values.type.slice(1);
		values.sex = values.sex.charAt(0).toUpperCase() + values.sex.slice(1);

		res.render('admin/profile', {
			title: 'Profile',
			active: {
				profile: true
			},
			imports: {
				uikit: true,
				uikit_icons: true
			},
			user: values,
			error: req.flash('error'),
			success: req.flash('success')
		});
	})
});

router.post('/', (req, res, next) => {

	req.checkBody('old_password', 'Old password is empty.').notEmpty();
	req.checkBody('new_password', 'New password length should be between 8 and 24').notEmpty().isLength({ min: 8, max: 24 });
	req.checkBody('confirm_password', 'Passwords do not match.').notEmpty().equals(req.body.new_password);

	if (req.validationErrors()) {
		req.flash('error', req.validationErrors()[0].msg);
		return res.redirect('/admin/profile/');
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
		return res.redirect('/admin/profile/');
	}).catch(err => {
		req.flash('error', err.message);
		return res.redirect('/admin/profile/');
	});
});

module.exports = router;