const express = require('express');
const router = express.Router();
const db = require('../database/');
const passport = require('passport');

/* GET home page. */
router.get('/', (req, res, next) => {
  // db.getConnection((err, con) => {
  //   if (err) throw err;
  //   con.query('SELECT * FROM person', (err, results, fields) => {
  //     con.release();
  //     console.log(results);
  //   });
  // });
  res.render('index', { title: 'Express', layout: false });
});

router.post('/', passport.authenticate('local.signin', {
  successRedirect: '/profile',
  failureRedirect: '/'
}));

module.exports = router;