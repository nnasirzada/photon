require('dotenv').config();
const path = require('path');
const flash = require('connect-flash');
const logger = require('morgan');
const express = require('express');
const favicon = require('serve-favicon');
const session = require('express-session');
const passport = require('passport');
const validator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('./config/passport');

// routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const admin = require('./routes/admin');
const instructor = require('./routes/instructor');
const student = require('./routes/student');
const parent = require('./routes/parent');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('x-powered-by', false);

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validator());
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET, name: 'SESSIONID', resave: false, saveUninitialized: false }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// uses
app.use('/', index);
app.use('/auth', auth);
app.use('/admin', admin);
app.use('/instructor', instructor);
app.use('/student', student);
app.use('/parent', parent);

app.get('/uploads/images/:id', (req, res) => {
  res.sendFile(req.params.id, { root: './uploads/images/' }, err => {
    res.sendFile('profile_default.png', { root: './public/assets/images/' }, err => {
      if (err) {
        let error = new Error('Not Found');
        error.status = 404;
        res.locals.error = error;
        res.status(error.status || 500);
        return res.render('error', { layout: false });
      }
    });
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.error = err;
  res.status(err.status || 500);
  res.render('error', { layout: false });
});

module.exports = app;