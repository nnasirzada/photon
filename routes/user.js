const express = require('express');
const router = express.Router(),
const { validate, schemas } = require('../helpers/routes/user'),
const userController = require('../controllers/user');

router.get('/', (req, res, next) => {
	res.render('user/signup');
});
router.post('/', validate(schemas.createUser), userController.signUp);

module.exports = router;