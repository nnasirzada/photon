const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
	res.render('user/signup');
});
// router.post('/', validate(schemas.createUser), userController.signUp);
router.post('/', passport.authenticate('local.signup', {
	successRedirect: '/signup/success',
	failureRedirect: '/'
}));

router.get('/success', (req, res, next) => {
	res.status(200).json({ success: true, message: 'Success! Signup DONE!' });
});

module.exports = router;