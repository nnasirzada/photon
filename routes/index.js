var crypto = require('crypto');
const express = require('express');
const router = express.Router();
const passport = require('passport');
// const database = require('../database');
const nodemailer = require('nodemailer');

router.get('/', (req, res, next) => {
  return res.render('index', { check_email: false, layout: false });
});

router.post('/', (req, res, next) => {

  res.locals.sign_in = req.body.sign_in;

  if (res.locals.sign_in == "true") return next();

  database.query("SELECT id FROM person WHERE email = ?", [req.body.email], (err, res) => {

    if (err || res.length == 0) return next();

    const person_id = res[0].id;
    const token = crypto.randomBytes(8).toString('hex');

    database.query("INSERT INTO forgot_password_token (person_id, token, expires_at)"
      + "VALUES (?, ?, NOW() + INTERVAL 1 DAY)", [person_id, token], function (err, res) {

        if (err) return next();

        let transporter = nodemailer.createTransport({
          host: 'shahinmursalov.com',
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: "photon@shahinmursalov.com", // generated ethereal user
            pass: "Admin123" // generated ethereal password
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        let mailOptions = {
          from: '"Photon" <photon@shahinmursalov.com>',
          to: req.body.email,
          subject: 'Reset your password',
          text: 'Click the following link to set a new password: http://shahinmursalov.com/authentication/reset-password/:email/:token' + token,
        };

        transporter.sendMail(mailOptions, (err, info) => {
          if (err) return console.log(error);
        });

        return next();
      });
  });
});

router.post('/', (req, res, next) => {
  if (res.locals.sign_in == "true") {
    return next();
  } else {
    return res.render('index', { check_email: true, layout: false });
  }
});

module.exports = router;