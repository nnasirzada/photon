const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/schedule_types", {
    title: "Schedule Types - Photon",
    active: {
      scheduleTypes: true
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
  models.ScheduleType.findAll().then((scheduleTypes) => {
    json['data'] = scheduleTypes;
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

  models.ScheduleType.findOne({
    where: { id: req.params.id }

  }).then((ScheduleType) => {
    if (!ScheduleType) throw new Error('Schedule type not found.');
    return models.ScheduleType.update(
      { code: req.body.code, name: req.body.name },
      { where: { id: ScheduleType.id } });

  }).then(result => {
    return models.ScheduleType.findOne({ where: { id: req.params.id } });

  }).then((ScheduleType) => {
    if (!ScheduleType) throw new Error('Schedule type not found.');
    return res.status(200).json(ScheduleType);

  }).catch(err => {
    return res.status(501).send('Failed to edit schedule type.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.ScheduleType.findOne({ where: { id: req.params.id } }).then((ScheduleType) => {
    if (!ScheduleType) throw new Error('Schedule type not found.');
    return models.ScheduleType.destroy({ where: { id: ScheduleType.id } })

  }).then(result => {
    return res.status(200).send('Schedule type successfully deleted.');

  }).catch(err => {
    return res.status(501).send('Failed to delete schedule type.');
  });
});

module.exports = router;