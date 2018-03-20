const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/subjects", {
    title: "Subjects - Photon",
    active: {
      subjects: true
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
  models.Subject.findAll({
    where: { deleted: false }
  }).then((subjects) => {
    json['data'] = subjects;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Subject.build(
    req.body

  ).save().then((Subject) => {
    if (!Subject) throw new Error('Failed to save subject.');
    return res.status(200).json(Subject);

  }).catch(err => {
    return res.status(501).send('Failed to save subject.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Subject.update(
    { code: req.body.code, name: req.body.name },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Subject.findOne({ where: { id: req.params.id } });

  }).then((Subject) => {
    if (!Subject) throw new Error('Subject not found.');
    return res.status(200).json(Subject);

  }).catch(err => {
    return res.status(501).send('Failed to edit subject.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Subject.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Subject successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete subject.');
  });
});

module.exports = router;