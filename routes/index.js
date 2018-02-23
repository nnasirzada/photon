const express = require('express');
const router = express.Router();
const db = require('../database/');

/* GET home page. */
router.get('/', function (req, res, next) {
  // db.getConnection((err, con) => {
  //   if (err) throw err;
  //   con.query('SELECT * FROM person', (err, results, fields) => {
  //     con.release();
  //     console.log(results);
  //   });
  // });
  res.render('index', { title: 'Express', layout: false });
});

module.exports = router;