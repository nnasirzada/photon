const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

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
  }).then((admins) => {
    json['data'] = admins;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.ScheduleType.build(
    req.body

  ).save().then((ScheduleType) => {
    if (!ScheduleType) throw new Error('Failed to save schedule type.');
    return res.status(200).json(ScheduleType);

  }).catch(err => {
    return res.status(501).send('Failed to save schedule type.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.ScheduleType.update(
    { code: req.body.code, name: req.body.name },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.ScheduleType.findOne({ where: { id: req.params.id } });

  }).then((ScheduleType) => {
    if (!ScheduleType) throw new Error('Schedule type not found.');
    return res.status(200).json(ScheduleType);

  }).catch(err => {
    return res.status(501).send('Failed to edit schedule type.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.ScheduleType.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Schedule type successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete schedule type.');
  });
});

module.exports = router;