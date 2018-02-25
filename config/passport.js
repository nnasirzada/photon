const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const models = require('../models');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	models.Person.findOne({
		where: {
			id: id
		}
	})
		.then((Person) => {
			done(null, Person);
		})
		.catch((err) => {
			done(err);
		});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true,
	session: false
}, (req, email, password, done) => {
	models.Person
		.findOne({
			where: {
				email: email
			}
		})
		.then((Person) => {
			if (Person) {
				console.log("user exist");
				return done(null, false);
			}
			let newPerson = models.Person.build(req.body);
			newPerson.password = bcrypt.hashSync(password, 5);
			return newPerson.save().then((newPerson) => { return done(null, newPerson) });
		})
		.catch((err) => {
			return done(err);
		})
}));

passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, (req, email, password, done) => {
	models.Person.findOne({
		where: {
			email: email
		}
	})
		.then((Person) => {
			if (!Person) {
				console.log("No such user");
				return done(null, false);
			}
			if (!bcrypt.compareSync(password, Person.password)) {
				console.log("Invalid pass");
				return done(null, false);
			}
			return done(null, Person);
		})
		.catch((err) => {
			return done(err);
		});
}));