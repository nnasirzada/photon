const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/schools", {
    title: "Schools - Photon",
    active: {
      schools: true
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
  models.School.findAll().then((schools) => {
    json['data'] = schools;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.School.build(
    req.body

  ).save().then((School) => {
    if (!School) throw new Error('Failed to save school.');
    return res.status(200).json(School);

  }).catch(err => {
    return res.status(501).send('Failed to save school.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.School.findOne({
    where: { id: req.params.id }

  }).then((School) => {
    if (!School) throw new Error('School not found.');
    return models.School.update(
      { code: req.body.code, name: req.body.name },
      { where: { id: School.id } });

  }).then(result => {
    return models.School.findOne({ where: { id: req.params.id } });

  }).then((School) => {
    if (!School) throw new Error('School not found.');
    return res.status(200).json(School);

  }).catch(err => {
    return res.status(501).send('Failed to edit school.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.School.findOne({ where: { id: req.params.id } }).then((School) => {
    if (!School) throw new Error('School not found.');
    return models.School.destroy({ where: { id: School.id } })

  }).then(result => {
    return res.status(200).send('School successfully deleted.');

  }).catch(err => {
    return res.status(501).send('Failed to delete school.');
  });
});

module.exports = router;