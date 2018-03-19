const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  res.locals = req.params;

  Promise.all([
    models.School.findAll(),
    models.Subject.findAll(),
    models.Program.findAll(),
    models.GradeMode.findAll(),
    models.GradeScale.findAll(),
    models.ScheduleType.findAll()
  ]).then(results => {
    res.render("admin/courses", {
      title: "Courses - Photon",
      active: {
        courses: true
      },
      imports: {
        uikit: true,
        jquery: true,
        jquery_ui: true,
        data_tables: true
      },
      schools: results[0],
      subjects: results[1],
      programs: results[2],
      gradeModes: results[3],
      gradeScales: results[4],
      scheduleTypes: results[5]
    });
  }).catch(console.error);
});

router.get('/all', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Course.findAll({
    include: [{
      model: models.School,
      required: true
    }, {
      model: models.Subject,
      required: true
    }, {
      model: models.Program,
      required: true
    }, {
      model: models.GradeScale,
      required: true
    }, {
      model: models.GradeMode,
      required: true
    }, {
      model: models.ScheduleType,
      required: true
    }],
    where: JSON.parse(JSON.stringify({
      school_id: req.params.school_id,
      subject_id: req.params.subject_id,
      program_id: req.params.program_id
    }))
  }).then((courses) => {
    json['data'] = courses;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('number', null).notEmpty().isInt({ min: 0 });
  req.checkBody('name', null).notEmpty();
  req.checkBody('description', null).notEmpty();
  req.checkBody('credit_hours', null).notEmpty().isDecimal({ min: 0 });
  req.checkBody('gpa_hours', null).notEmpty().isDecimal({ min: 0 });
  if (!req.params.school_id) req.checkBody('school_id', null).notEmpty().isInt({ min: 0 });
  if (!req.params.subject_id) req.checkBody('subject_id', null).notEmpty().isInt({ min: 0 });
  if (!req.params.program_id) req.checkBody('program_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('grade_mode_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('passing_grade_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('schedule_type_id', null).notEmpty().isInt({ min: 0 });

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  let params = JSON.parse(JSON.stringify({
    school_id: req.params.school_id,
    subject_id: req.params.subject_id,
    program_id: req.params.program_id
  }));

  Object.assign(params, req.body);

  models.Course.build(
    params

  ).save().then((Course) => {
    return models.Course.findOne({
      include: [{
        model: models.School,
        required: true
      }, {
        model: models.Subject,
        required: true
      }, {
        model: models.Program,
        required: true
      }, {
        model: models.GradeScale,
        required: true
      }, {
        model: models.GradeMode,
        required: true
      }, {
        model: models.ScheduleType,
        required: true
      }]
      , where: {
        id: Course.id
      }
    });
  }).then(Course => {
    if (!Course) throw new Error('Failed to save course.');
    return res.status(200).json(Course);
  }).catch(err => {
    return res.status(501).send('Failed to save course.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('number', null).notEmpty().isInt({ min: 0 });
  req.checkBody('name', null).notEmpty();
  req.checkBody('description', null).notEmpty();
  req.checkBody('credit_hours', null).notEmpty().isDecimal({ min: 0 });
  req.checkBody('gpa_hours', null).notEmpty().isDecimal({ min: 0 });
  if (!req.params.school_id) req.checkBody('school_id', null).notEmpty().isInt({ min: 0 });
  if (!req.params.subject_id) req.checkBody('subject_id', null).notEmpty().isInt({ min: 0 });
  if (!req.params.program_id) req.checkBody('program_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('grade_mode_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('passing_grade_id', null).notEmpty().isInt({ min: 0 });
  req.checkBody('schedule_type_id', null).notEmpty().isInt({ min: 0 });

  if (req.validationErrors()) {
    console.log(req.validationErrors());
    return res.status(501).send('Form is incomplete.');
  }

  models.Course.findOne({
    where: { id: req.params.id }

  }).then((Course) => {
    if (!Course) throw new Error('Course not found.');
    return models.Course.update(req.body, { where: { id: Course.id } });

  }).then(result => {
    return models.Course.findOne({
      include: [{
        model: models.School,
        required: true
      }, {
        model: models.Subject,
        required: true
      }, {
        model: models.Program,
        required: true
      }, {
        model: models.GradeScale,
        required: true
      }, {
        model: models.GradeMode,
        required: true
      }, {
        model: models.ScheduleType,
        required: true
      }]
      , where: { id: req.params.id }
    });
  }).then((Course) => {
    if (!Course) throw new Error('Course not found.');
    return res.status(200).json(Course);
  }).catch(err => {
    return res.status(501).send('Failed to edit course.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Course.findOne({ where: { id: req.params.id } }).then((Course) => {
    if (!Course) throw new Error('Course not found.');
    return models.Course.destroy({ where: { id: Course.id } })

  }).then(result => {
    return res.status(200).send('Course successfully deleted.');

  }).catch(err => {
    return res.status(501).send('Failed to delete course.');
  });
});

module.exports = router;