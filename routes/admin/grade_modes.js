const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/grade_modes", {
    title: "Grade Modes - Photon",
    active: {
      gradeModes: true
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
  models.GradeMode.findAll().then((gradeModes) => {
    json['data'] = gradeModes;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.GradeMode.build(
    req.body

  ).save().then((GradeMode) => {
    if (!GradeMode) throw new Error('Failed to save grade mode.');
    return res.status(200).json(GradeMode);

  }).catch(err => {
    return res.status(501).send('Failed to save grade mode.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.GradeMode.findOne({
    where: { id: req.params.id }

  }).then((GradeMode) => {
    if (!GradeMode) throw new Error('Grade mode not found.');
    return models.GradeMode.update(
      { code: req.body.code, name: req.body.name },
      { where: { id: GradeMode.id } });

  }).then(result => {
    return models.GradeMode.findOne({ where: { id: req.params.id } });

  }).then((GradeMode) => {
    if (!GradeMode) throw new Error('Grade mode not found.');
    return res.status(200).json(GradeMode);

  }).catch(err => {
    return res.status(501).send('Failed to edit grade mode.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.GradeMode.findOne({ where: { id: req.params.id } }).then((GradeMode) => {
    if (!GradeMode) throw new Error('Grade mode not found.');
    return models.GradeMode.destroy({ where: { id: GradeMode.id } })

  }).then(result => {
    return res.status(200).send('Grade mode successfully deleted.');

  }).catch(err => {
    return res.status(501).send('Failed to delete grade mode.');
  });
});

module.exports = router;