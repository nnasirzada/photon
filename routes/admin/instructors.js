const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  res.locals = req.params;

  Promise.all([
    models.School.findAll({
      where: { deleted: false }
    }),
    models.Subject.findAll({
      where: { deleted: false }
    }),
    models.Program.findAll({
      where: { deleted: false }
    }),
    models.GradeMode.findAll({
      where: { deleted: false }
    }),
    models.GradeScale.findAll({
      where: { deleted: false }
    }),
    models.ScheduleType.findAll({
      where: { deleted: false }
    })
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
      jGradeScales: JSON.stringify(results[4]),
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
      program_id: req.params.program_id,
      deleted: false
    }))
  }).then((courses) => {
    json['data'] = courses;
    res.status(200).json(json);
  }).catch(console.log);
});

router.get('/search/:keyword', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.User.findAll({
    where: {
      deleted: false,
      type: 'instructor',
      [models.Sequelize.Op.or]: [
        {
          id: {
            [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
          }
        },
        models.Sequelize.where(models.Sequelize.fn('concat', models.Sequelize.col('firstname'), ' ', models.Sequelize.col('lastname')), {
          [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
        })
      ]
    }
  }).then((instructors) => {
    json['data'] = instructors;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('number', 'Number should be a positive number.').notEmpty().isInt({ min: 0 });
  req.checkBody('name', 'Name cannot be empty.').notEmpty();
  req.checkBody('description', 'Description cannot be empty.').notEmpty();
  req.checkBody('credit_hours', 'Credit hours should be a positive decimal.').notEmpty().isDecimal({ min: 0 });
  req.checkBody('gpa_hours', 'GPA hours should be a positive decimal.').notEmpty().isDecimal({ min: 0 });
  if (!req.params.school_id) req.checkBody('school_id', 'Select a correct school.').notEmpty().isInt({ min: 0 });
  if (!req.params.subject_id) req.checkBody('subject_id', 'Select a correct subject.').notEmpty().isInt({ min: 0 });
  if (!req.params.program_id) req.checkBody('program_id', 'Select a correct program.').notEmpty().isInt({ min: 0 });
  req.checkBody('grade_mode_id', 'Select a correct grade mode.').notEmpty().isInt({ min: 0 });
  req.checkBody('passing_grade_id', 'Select a correct passing grade.').notEmpty().isInt({ min: 0 });
  req.checkBody('schedule_type_id', 'Select a correct schedule type.').notEmpty().isInt({ min: 0 });

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

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

  req.checkBody('number', 'Number should be a positive number.').notEmpty().isInt({ min: 0 });
  req.checkBody('name', 'Name cannot be empty.').notEmpty();
  req.checkBody('description', 'Description cannot be empty.').notEmpty();
  req.checkBody('credit_hours', 'Credit hours should be a positive decimal.').notEmpty().isDecimal({ min: 0 });
  req.checkBody('gpa_hours', 'GPA hours should be a positive decimal.').notEmpty().isDecimal({ min: 0 });
  if (!req.params.school_id) req.checkBody('school_id', 'Select a correct school.').notEmpty().isInt({ min: 0 });
  if (!req.params.subject_id) req.checkBody('subject_id', 'Select a correct subject.').notEmpty().isInt({ min: 0 });
  if (!req.params.program_id) req.checkBody('program_id', 'Select a correct program.').notEmpty().isInt({ min: 0 });
  req.checkBody('grade_mode_id', 'Select a correct grade mode.').notEmpty().isInt({ min: 0 });
  req.checkBody('passing_grade_id', 'Select a correct passing grade.').notEmpty().isInt({ min: 0 });
  req.checkBody('schedule_type_id', 'Select a correct schedule type.').notEmpty().isInt({ min: 0 });

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  models.Course.update(
    req.body, { where: { id: req.params.id } }

  ).then(result => {
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

  models.Course.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Course successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete course.');
  });
});

module.exports = router;