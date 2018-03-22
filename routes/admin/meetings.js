const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  models.Class.findOne({
    where: {
      id: req.params.class_id,
      deleted: false
    },
    include: [
      {
        model: models.Course,
        required: true,
        include: [
          {
            model: models.Subject,
            required: true
          }
        ]
      }
    ]
  }).then((Class) => {
    if (!Class) throw new Error('Class not found.');

    res.render("admin/meetings", {
      title: Class.Course.Subject.code + " " + Class.Course.number + " - " + Class.Course.name + " - Section " + Class.section + " Meetings - Photon",
      class: Class,
      active: {
        classes: true
      },
      imports: {
        uikit: true,
        jquery: true,
        jquery_ui: true,
        data_tables: true,
        time_picker: true
      }
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
  models.ClassMeeting.findAll({
    where: {
      class_id: req.params.class_id,
      deleted: false
    },
    include: [
      {
        model: models.Room,
        required: true,
        include: [
          {
            model: models.Building,
            required: true
          }
        ]
      }
    ]
  }).then((meetings) => {
    json['data'] = meetings;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('room_id', 'Please select a room.').notEmpty();
  req.checkBody('start_time', 'Please select a start time').notEmpty();
  req.checkBody('end_time', 'Please select an end time').notEmpty();

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  if (req.body.start_time > req.body.end_time) {
    return res.status(501).send('Please provide a valid time range.');
  }

  let params = JSON.parse(JSON.stringify({
    class_id: req.params.class_id,
    monday: (typeof req.body.monday !== 'undefined' && req.body.monday) ? req.body.monday : 0,
    tuesday: (typeof req.body.tuesday !== 'undefined' && req.body.tuesday) ? req.body.tuesday : 0,
    wednesday: (typeof req.body.wednesday !== 'undefined' && req.body.wednesday) ? req.body.wednesday : 0,
    thursday: (typeof req.body.thursday !== 'undefined' && req.body.thursday) ? req.body.thursday : 0,
    friday: (typeof req.body.friday !== 'undefined' && req.body.friday) ? req.body.friday : 0,
    saturday: (typeof req.body.saturday !== 'undefined' && req.body.saturday) ? req.body.saturday : 0,
    sunday: (typeof req.body.sunday !== 'undefined' && req.body.sunday) ? req.body.sunday : 0
  }));

  Object.assign(params, req.body);

  models.ClassMeeting.build(
    params

  ).save().then(ClassMeeting => {
    if (!ClassMeeting) throw new Error('Failed to save meeting.');
    return models.ClassMeeting.findOne({
      where: {
        id: ClassMeeting.id
      },
      include: [
        {
          model: models.Room,
          required: true,
          include: [
            {
              model: models.Building,
              required: true
            }
          ]
        }
      ]
    });
  }).then(ClassMeeting => {
    if (!ClassMeeting) throw new Error('Failed to save meeting.');
    return res.status(200).json(ClassMeeting);
  }).catch(err => {
    return res.status(501).send('Failed to save meeting.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('room_id', 'Please select a room.').notEmpty();
  req.checkBody('start_time', 'Please select a start time').notEmpty();
  req.checkBody('end_time', 'Please select an end time').notEmpty();

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  if (req.body.start_time > req.body.end_time) {
    return res.status(501).send('Please provide a valid time range.');
  }

  let params = JSON.parse(JSON.stringify({
    monday: (typeof req.body.monday !== 'undefined' && req.body.monday) ? req.body.monday : 0,
    tuesday: (typeof req.body.tuesday !== 'undefined' && req.body.tuesday) ? req.body.tuesday : 0,
    wednesday: (typeof req.body.wednesday !== 'undefined' && req.body.wednesday) ? req.body.wednesday : 0,
    thursday: (typeof req.body.thursday !== 'undefined' && req.body.thursday) ? req.body.thursday : 0,
    friday: (typeof req.body.friday !== 'undefined' && req.body.friday) ? req.body.friday : 0,
    saturday: (typeof req.body.saturday !== 'undefined' && req.body.saturday) ? req.body.saturday : 0,
    sunday: (typeof req.body.sunday !== 'undefined' && req.body.sunday) ? req.body.sunday : 0
  }));

  Object.assign(params, req.body);

  models.ClassMeeting.update(
    params,
    { where: { id: req.params.id } }
  ).then(result => {
    return models.ClassMeeting.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: models.Room,
          required: true,
          include: [
            {
              model: models.Building,
              required: true
            }
          ]
        }
      ]
    });
  }).then((ClassMeeting) => {
    if (!ClassMeeting) throw new Error('Meeting not found.');
    return res.status(200).json(ClassMeeting);
  }).catch(err => {
    return res.status(501).send('Failed to edit meeting.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.ClassMeeting.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Meeting successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete meeting.');
  });
});

module.exports = router;