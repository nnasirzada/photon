const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  res.locals = req.params;

  res.render("admin/classes", {
    title: "Classes - Photon",
    active: {
      classes: true
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
  models.Class.findAll({
    where: JSON.parse(JSON.stringify({
      part_of_term_id: req.params.part_of_term_id,
      instructor_id: req.params.instructor_id,
      course_id: req.params.course_id,
      deleted: false
    })),
    include: [{
      model: models.Course,
      required: true,
      include: [{
        model: models.Subject,
        required: true
      }]
    }, {
      model: models.PartOfTerm,
      required: true,
      include: [{
        model: models.Term,
        required: true
      }]
    }, {
      model: models.User,
      required: true
    }]
  }).then((classes) => {
    json['data'] = classes;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  if (!req.params.course_id) req.checkBody('course_id', 'Please select a course.').notEmpty();
  if (!req.params.instructor_id) req.checkBody('instructor_id', 'Please select an instructor.').notEmpty();
  if (!req.params.part_of_term_id) req.checkBody('part_of_term_id', 'Please select a term.').notEmpty();
  req.checkBody('max_enrollment', 'Please enter a maximum enrollment number.').notEmpty().isNumeric({ min: 0 });
  req.checkBody('section', 'Please enter a section.').notEmpty();
  req.checkBody('status', 'Please select a status.').notEmpty().isIn(['open', 'closed']);

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  let params = JSON.parse(JSON.stringify({
    course_id: req.params.course_id,
    instructor_id: req.params.instructor_id,
    part_of_term_id: req.params.part_of_term_id
  }));

  Object.assign(params, req.body);

  models.Class.build(
    params

  ).save().then((Class) => {
    if (!Class) throw new Error('Failed to save class.');
    return models.Class.findOne({
      where: { id: Class.id },
      include: [{
        model: models.Course,
        required: true,
        include: [{
          model: models.Subject,
          required: true
        }]
      }, {
        model: models.PartOfTerm,
        required: true,
        include: [{
          model: models.Term,
          required: true
        }]
      }, {
        model: models.User,
        required: true
      }]
    })

  }).then((Class) => {
    if (!Class) throw new Error('Class not found.');
    return res.status(200).json(Class);

  }).catch(err => {
    return res.status(501).send('Failed to save class.');
  });
});

router.put('/:id', (req, res, next) => {

  if (!req.params.course_id) req.checkBody('course_id', 'Please select a course.').notEmpty();
  if (!req.params.instructor_id) req.checkBody('instructor_id', 'Please select an instructor.').notEmpty();
  if (!req.params.part_of_term_id) req.checkBody('part_of_term_id', 'Please select a term.').notEmpty();
  req.checkBody('max_enrollment', 'Please enter a maximum enrollment number.').notEmpty().isNumeric({ min: 0 });
  req.checkBody('section', 'Please enter a section.').notEmpty();
  req.checkBody('status', 'Please select a status.').notEmpty().isIn(['open', 'closed']);

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  models.Class.update(
    req.body,
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Class.findOne({
      where: { id: req.params.id },
      include: [{
        model: models.Course,
        required: true,
        include: [{
          model: models.Subject,
          required: true
        }]
      }, {
        model: models.PartOfTerm,
        required: true,
        include: [{
          model: models.Term,
          required: true
        }]
      }, {
        model: models.User,
        required: true
      }]
    })

  }).then((Class) => {
    if (!Class) throw new Error('Class not found.');
    return res.status(200).json(Class);

  }).catch(err => {
    return res.status(501).send('Failed to edit class.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Class.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Class successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete class.');
  });
});

module.exports = router;