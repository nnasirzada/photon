const express = require('express');
const router = express.Router();
const models = require('../../models');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) => {
    models.Student.getProfileData(req.user.id).then(Student => {

        res.render('student/profile', {
            title: 'Profile - Photon',
            active: {
                profile: true
            },
            imports: {
                uikit: true,
                uikit_icons: true
            },
            student: Student[0],
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
        return res.redirect('/student/profile/');
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
        return res.redirect('/student/profile/');
    }).catch(err => {
        req.flash('error', err.message);
        return res.redirect('/student/profile/');
    });
});

module.exports = router;