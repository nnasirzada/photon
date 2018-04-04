const express = require('express');
const router = express.Router();
const models = require('../../models');
const bcrypt = require('bcrypt');

router.get('/', (req, res, next) => {
    models.Student.getProfileData(req.user.id).then(Student => {
        res.render('student/profile', {
            title: 'Profile',
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
    req.checkBody('oldpassword', null).notEmpty();
    req.checkBody('newpassword', null).notEmpty().isLength({min: 8, max: 24});
    req.checkBody('confirmpassword', null).notEmpty().equals(req.body.newpassword);

    if (req.validationErrors()) {
        req.flash('error', 'Form inputs are not valid!');
        res.redirect('/student/profile');
    } else {
        models.User.findOne({
            where: {
                id: req.user.id
            }
        }).then(User => {
            if (!bcrypt.compareSync(req.body.oldpassword, User.password)) {
                throw new Error('Old password is wrong!');
            } else {
                return models.User.update({password: req.body.newpassword}, {
                    where: {id: req.user.id},
                    individualHooks: true
                });
            }
        }).then(result => {
            req.flash('success', 'Password updated');
            res.redirect('/student/profile');
        }).catch(err => {
            req.flash('error', err.message);
            res.redirect('/student/profile');
        });
    }
});

module.exports = router;