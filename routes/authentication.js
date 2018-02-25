const express = require('express');
const router = express.Router();
const passport = require('passport');

router.post('/login', passport.authenticate('local.signin', {
	successRedirect: '/user',
	failureRedirect: '/'
}));

router.post('/reset-password', (req, res, next) => {

})

module.exports = router;