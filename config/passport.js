const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const database = require('../database');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	database.getConnection((err, connection) => {
		connection.query("SELECT * FROM person WHERE id = ?", [id], (err, results) => {
			connection.release();
			done(err, results[0]);
		});
	});
});

passport.use('local.signup', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, (req, email, password, done) => {
	database.getConnection((err, connection) => {
		connection.query("SELECT * FROM person WHERE email = ?", [email], (err, results) => {
			if (err) {
				return done(err);
			}
			if (results.length) {
				return done(null, false, { message: 'Email is already in use.' });
			} else {
				let newUser = {
					email: email,
					password: bcrypt.hashSync(password, 5)
				};

				connection.query("INSERT INTO person (email, password) values (?, ?)", [newUser.email, newUser.password], (err, results) => {
					if (err) {
						return done(err);
					}
					newUser.id = results.insertId;
					return done(null, newUser);
				})
			}
		})
	})
}));