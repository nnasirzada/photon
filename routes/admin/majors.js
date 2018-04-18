const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {

  Promise.all([
    models.School.findAll({
      where: { deleted: false }
    }),
    models.Program.findAll({
      where: { deleted: false }
    })
  ]).then(results => {
    res.render("admin/majors", {
      title: "Majors - Photon",
      active: {
        majors: true
      },
      imports: {
        uikit: true,
        jquery: true,
        jquery_ui: true,
        data_tables: true
      },
      schools: results[0],
      programs: results[1]
    });
  }).catch(err => {
    res.locals.error = err;
    res.status(err.status || 500);
    return res.render('error', { layout: false });
  });
});

router.get('/all', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Major.findAll({
    include: [{
      model: models.School,
      required: true
    }, {
      model: models.Program,
      required: true
    }],
    where: { deleted: false }
  }).then((majors) => {
    json['data'] = majors;
    res.status(200).json(json);
  }).catch(console.log);
});

router.get('/search/:keyword', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Major.findAll({
    where: {
      deleted: false,
      [models.Sequelize.Op.or]: [
        {
          code: {
            [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
          }
        }, {
          name: {
            [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
          }
        }
      ]
    }
  }).then((majors) => {
    json['data'] = majors;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('school_id', null).notEmpty();
  req.checkBody('program_id', null).notEmpty();
  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Major.build(
    req.body

  ).save().then((Major) => {
    return models.Major.findOne({
      include: [{
        model: models.School,
        required: true
      }, {
        model: models.Program,
        required: true
      }]
      , where: { id: Major.id }
    });
  }).then(Major => {
    if (!Major) throw new Error('Failed to save major.');
    return res.status(200).json(Major);
  }).catch(err => {
    return res.status(501).send('Failed to save major.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('school_id', null).notEmpty();
  req.checkBody('program_id', null).notEmpty();
  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Major.update(
    req.body, { where: { id: req.params.id } }

  ).then(result => {
    return models.Major.findOne({
      include: [{
        model: models.School,
        required: true
      }, {
        model: models.Program,
        required: true
      }]
      , where: { id: req.params.id }
    });
  }).then((Major) => {
    if (!Major) throw new Error('Major not found.');
    return res.status(200).json(Major);
  }).catch(err => {
    return res.status(501).send('Failed to edit major.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Major.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Major successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete major.');
  });
});

module.exports = router;