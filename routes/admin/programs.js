const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/programs", {
    title: "Programs - Photon",
    active: {
      programs: true
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
  models.Program.findAll({
    where: { deleted: false }
  }).then((programs) => {
    json['data'] = programs;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Program.build(
    req.body

  ).save().then((Program) => {
    if (!Program) throw new Error('Failed to save program.');
    return res.status(200).json(Program);

  }).catch(err => {
    return res.status(501).send('Failed to save program.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Program.update(
    { code: req.body.code, name: req.body.name },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Program.findOne({ where: { id: req.params.id } });

  }).then((Program) => {
    if (!Program) throw new Error('Program not found.');
    return res.status(200).json(Program);

  }).catch(err => {
    return res.status(501).send('Failed to edit program.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Program.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Program successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete program.');
  });
});

module.exports = router;