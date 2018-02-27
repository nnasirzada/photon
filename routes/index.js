const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res, next) => {
  if (req.isAuthenticated())
    return res.redirect('/auth/redirect');
  else
    return res.redirect('/auth/login');
});

module.exports = router;