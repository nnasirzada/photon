const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {

  Promise.all([
    models.School.findAll(),
    models.Program.findAll()
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
  }).catch(console.error);
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
    }]
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

  models.Major.findOne({
    where: { id: req.params.id }

  }).then((Major) => {
    if (!Major) throw new Error('Major not found.');
    return models.Major.update(req.body, { where: { id: Major.id } });

  }).then(result => {
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

  models.Major.findOne({ where: { id: req.params.id } }).then((Major) => {
    if (!Major) throw new Error('Major not found.');
    return models.Major.destroy({ where: { id: Major.id } })

  }).then(result => {
    return res.status(200).send('Major successfully deleted.');

  }).catch(err => {
    return res.status(501).send('Failed to delete major.');
  });
});

module.exports = router;