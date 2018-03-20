const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/buildings", {
    title: "Buildings - Photon",
    active: {
      buildings: true
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
  models.Building.findAll({
    where: { deleted: false }
  }).then((buildings) => {
    json['data'] = buildings;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Building.build(
    req.body

  ).save().then((Building) => {
    if (!Building) throw new Error('Failed to save building.');
    return res.status(200).json(Building);

  }).catch(err => {
    return res.status(501).send('Failed to save building.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Building.update(
    { code: req.body.code, name: req.body.name },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Building.findOne({ where: { id: req.params.id } });

  }).then((Building) => {
    if (!Building) throw new Error('Building not found.');
    return res.status(200).json(Building);

  }).catch(err => {
    return res.status(501).send('Failed to edit building.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Building.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Building successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete building.');
  });
});

module.exports = router;