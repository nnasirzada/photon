const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  models.Course.findOne({
    where: {
      id: req.params.course_id,
      deleted: false
    },
    include: [{
      model: models.Subject,
      required: true
    }]

  }).then((Course) => {
    if (!Course) throw new Error('Course not found.');

    res.render("admin/prerequisites", {
      title: Course.Subject.code + " " + Course.number + " - " + Course.name + " Prerequisites - Photon",
      course: Course,
      active: {
        courses: true
      },
      imports: {
        uikit: true,
        jquery: true,
        jquery_ui: true,
        data_tables: true
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
  models.CoursePrerequisite.findAll({
    where: {
      course_id: req.params.course_id,
      deleted: false
    },
    include: [{
      model: models.Course,
      required: true,
      include: [{
        model: models.School,
        required: true
      }, {
        model: models.Subject,
        required: true
      }]
    }]
  }).then((coursePrerequisites) => {
    json['data'] = coursePrerequisites;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('prerequisite_id', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.CoursePrerequisite.build({
    'course_id': req.params.course_id,
    'prerequisite_id': req.body.prerequisite_id

  }).save().then((CoursePrerequisite) => {
    if (!CoursePrerequisite) throw new Error('Failed to save prerequisite.');
    return models.CoursePrerequisite.findOne({
      where: { id: CoursePrerequisite.id },
      include: [{
        model: models.Course,
        required: true,
        include: [{
          model: models.School,
          required: true
        }, {
          model: models.Subject,
          required: true
        }]
      }]
    })

  }).then((CoursePrerequisite) => {
    if (!CoursePrerequisite) throw new Error('Prerequisite not found.');
    return res.status(200).json(CoursePrerequisite);

  }).catch(err => {
    return res.status(501).send('Failed to save prerequisite.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('prerequisite_id', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.CoursePrerequisite.update(
    { prerequisite_id: req.body.prerequisite_id },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.CoursePrerequisite.findOne({
      where: { id: req.params.id },
      include: [{
        model: models.Course,
        required: true,
        include: [{
          model: models.School,
          required: true
        }, {
          model: models.Subject,
          required: true
        }]
      }]
    })

  }).then((CoursePrerequisite) => {
    if (!CoursePrerequisite) throw new Error('Prerequisite not found.');
    return res.status(200).json(CoursePrerequisite);

  }).catch(err => {
    return res.status(501).send('Failed to edit prerequisite.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.CoursePrerequisite.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Prerequisite successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete prerequisite.');
  });
});

module.exports = router;