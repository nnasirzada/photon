const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const models = require('../models');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	models.User.findOne({
		where: { id: id },
		attributes: {
			exclude: ['password']
		}
	}).then((User) => {
		done(null, User);
	}).catch((err) => {
		done(err);
	});
});

passport.use('local.login', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password',
	passReqToCallback: true
}, (req, email, password, done) => {

	models.User.findOne({
		where: { deleted: false, email: email }
	}).then((User) => {
		if (!User) {
			console.log("User not found.");
			return done(null, false, { message: "Invalid credentials." });
		}
		if (!bcrypt.compareSync(password, User.password)) {
			console.log("Invalid password.");
			return done(null, false, { message: "Invalid credentials." });
		}
		return done(null, User);
	}).catch((err) => {
		return done(err);
	});
}));