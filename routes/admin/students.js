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
  res.render("admin/students", {
    title: "Students - Photon",
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
  models.Student.findAll({
    include: [{
      model: models.User,
      required: true,
      where: {
        deleted: false
      }
    }, {
      model: models.Major,
      required: true
    }, {
      model: models.Term,
      as: 'AdmitTerm',
      required: true
    }, {
      model: models.Term,
      as: 'GraduationTerm'
    }]
  }).then((users) => {
    json['data'] = users;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  upload(req, res, function (err) {

    if (err) return res.status(501).send(err.message);

    if (!req.file) return res.status(501).send('Please upload an image.');

    req.checkBody('firstname', 'Please enter a firstname.').notEmpty();
    req.checkBody('lastname', 'Please enter a lastname.').notEmpty();
    req.checkBody('patronymic', 'Please enter a patronymic.').notEmpty();
    req.checkBody('date_of_birth', 'Please enter a date of birth.').notEmpty();
    req.checkBody('sex', 'Please select a sex.').notEmpty().isIn(['male', 'female', 'other']);
    req.checkBody('status_login', 'Please select a login status.').notEmpty().isIn(['active', 'deactive']);
    req.checkBody('address', 'Please select an address.').notEmpty();
    req.checkBody('email', 'Please enter an email.').notEmpty().isEmail();
    req.checkBody('password', 'Please enter a password.').notEmpty();
    req.checkBody('major_id', 'Please select a major.').notEmpty();
    req.checkBody('admit_term_id', 'Please select an admit term.').notEmpty();
    req.checkBody('status_academic', 'Please select an academic status.').notEmpty();

    if (req.validationErrors())
      return res.status(501).send(req.validationErrors()[0].msg);

    if (validator.isEmpty(req.body.graduation_term_id)) delete req.body.graduation_term_id;

    let params = JSON.parse(JSON.stringify({
      image_path: req.file.filename,
      type: 'student'
    }));

    Object.assign(params, req.body);

    models.User.build(
      JSON.parse(JSON.stringify(params))
    ).save().then(User => {
      if (!User) throw new Error(null);
      let new_params = JSON.parse(JSON.stringify({
        user_id: User.id
      }));
      Object.assign(new_params, params);
      return models.Student.build(JSON.parse(JSON.stringify(new_params))).save();
    }).then(Student => {
      if (!Student) throw new Error(null);
      return models.Student.findOne({
        where: {
          user_id: Student.user_id
        },
        include: [{
          model: models.User,
          required: true,
          where: {
            deleted: false
          }
        }, {
          model: models.Major,
          required: true
        }, {
          model: models.Term,
          as: 'AdmitTerm',
          required: true
        }, {
          model: models.Term,
          as: 'GraduationTerm'
        }]
      });
    }).then(Student => {
      if (!Student) throw new Error(null);
      return res.status(200).json(Student);
    }).catch(err => {
      return res.status(501).send('Failed to save user. Make sure user has unique ID and email.');
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
    req.checkBody('status_login', 'Please select a login status.').notEmpty().isIn(['active', 'deactive']);
    req.checkBody('address', 'Please select an address.').notEmpty();
    req.checkBody('email', 'Please enter an email.').notEmpty().isEmail();
    //req.checkBody('password', 'Please enter a password.').notEmpty();
    req.checkBody('major_id', 'Please select a major.').notEmpty();
    req.checkBody('admit_term_id', 'Please select an admit term.').notEmpty();
    req.checkBody('status_academic', 'Please select an academic status.').notEmpty();

    if (req.validationErrors())
      return res.status(501).send(req.validationErrors()[0].msg);

    if (validator.isEmpty(req.body.graduation_term_id)) delete req.body.graduation_term_id;
    if (validator.isEmpty(req.body.password)) delete req.body.password;

    let params = JSON.parse(JSON.stringify({
      user_id: req.params.id,
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
      return models.Student.update(
        JSON.parse(JSON.stringify(params)),
        { where: { user_id: req.params.id } }
      );
    }).then(result => {
      return models.Student.findOne({
        where: {
          user_id: req.params.id
        },
        include: [{
          model: models.User,
          required: true,
          where: {
            deleted: false
          }
        }, {
          model: models.Major,
          required: true
        }, {
          model: models.Term,
          as: 'AdmitTerm',
          required: true
        }, {
          model: models.Term,
          as: 'GraduationTerm'
        }]
      });
    }).then(Student => {
      if (!Student) throw new Error(null);
      return res.status(200).json(Student);
    }).catch(err => {
      return res.status(501).send('Failed to update user. Make sure user has unique ID email.');
    });
  });
})

router.delete('/:id', (req, res, next) => {

  models.User.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return models.Student.update(
      { deleted: true },
      { where: { user_id: req.params.id } }
    );
  }).then(result => {
    return res.status(200).send('User successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete user.');
  });
});

module.exports = router;