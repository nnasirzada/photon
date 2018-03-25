const path = require('path');
const multer = require('multer');
const uuidv1 = require('uuid/v1');
const express = require("express");
const passport = require("passport");
const validator = require('validator');
const models = require('../../models');
const router = express.Router();
const upload = multer({
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image'))
      return cb(new Error('Please upload an image.'))
    cb(null, true)
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/images/')
    },
    filename: function (req, file, cb) {
      cb(null, uuidv1() + path.extname(file.originalname))
    }
  })
}).single('image');

router.get("/", (req, res, next) => {
  res.render("admin/admins", {
    title: "Admins - Photon",
    active: {
      users: true
    },
    imports: {
      uikit: true,
      jquery: true,
      jquery_ui: true,
      data_tables: true
    }
  });
});

router.get('/all', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.User.findAll({
    where: {
      type: 'admin',
      deleted: false
    }
  }).then((users) => {
    json['data'] = users;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  upload(req, res, function (err) {

    if (err) return res.status(501).send(err.message);

    if (!req.file) return res.status(501).send('Please upload an image.');

    if (!validator.isEmpty(req.body.id) && (req.body.id < 0 || req.body.id > 18446744073709551615))
      return res.status(501).send('Please enter a positive number as ID.');

    req.checkBody('firstname', 'Please enter a firstname.').notEmpty();
    req.checkBody('lastname', 'Please enter a lastname.').notEmpty();
    req.checkBody('patronymic', 'Please enter a patronymic.').notEmpty();
    req.checkBody('date_of_birth', 'Please enter a date of birth.').notEmpty();
    req.checkBody('sex', 'Please select a sex.').notEmpty().isIn(['male', 'female', 'other']);
    req.checkBody('address', 'Please select an address.').notEmpty();
    req.checkBody('email', 'Please enter an email.').notEmpty().isEmail();
    req.checkBody('password', 'Please enter a password.').notEmpty();

    if (req.validationErrors())
      return res.status(501).send(req.validationErrors()[0].msg);

    let params = JSON.parse(JSON.stringify({
      image_path: req.file.filename,
      type: 'admin'
    }));

    Object.assign(params, req.body);

    models.User.build(
      JSON.parse(JSON.stringify(params))
    ).save().then((User) => {
      if (!User) throw new Error(null);
      return res.status(200).json(User);
    }).catch(err => {
      return res.status(501).send('Failed to save user. Make sure user has unique ID.');
    });
  });
});

router.put('/:id', (req, res, next) => {

  upload(req, res, function (err) {

    if (err) return res.status(501).send(err.message);

    req.checkBody('firstname', 'Please enter a firstname.').notEmpty();
    req.checkBody('lastname', 'Please enter a lastname.').notEmpty();
    req.checkBody('patronymic', 'Please enter a patronymic.').notEmpty();
    req.checkBody('date_of_birth', 'Please enter a date of birth.').notEmpty();
    req.checkBody('sex', 'Please select a sex.').notEmpty().isIn(['male', 'female', 'other']);
    req.checkBody('address', 'Please select an address.').notEmpty();
    req.checkBody('email', 'Please enter an email.').notEmpty().isEmail();
    //req.checkBody('password', 'Please enter a password.').notEmpty();

    if (req.validationErrors())
      return res.status(501).send(req.validationErrors()[0].msg);

    delete req.body.id;

    let params = JSON.parse(JSON.stringify({
      image_path: !req.file ? undefined : req.file.filename
    }));

    Object.assign(params, req.body);

    models.User.update(
      JSON.parse(JSON.stringify(params)),
      {
        where: {
          id: req.params.id
        },
        individualHooks: true
      }
    ).then(result => {
      return models.User.findOne({ where: { id: req.params.id } });
    }).then(User => {
      if (!User) throw new Error(null);
      return res.status(200).json(User);
    }).catch(err => {
      return res.status(501).send('Failed to update user. Make sure user has unique ID.');
    });
  });
})

router.delete('/:id', (req, res, next) => {

  models.User.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Admin successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete admin.');
  });
});

module.exports = router;