const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  models.GradeMode.findOne({
    where: {
      id: req.params.grade_mode_id,
      deleted: false
    }
  }).then((GradeMode) => {
    if (!GradeMode) throw new Error('Grade mode not found.');

    res.render("admin/grade-scale", {
      title: GradeMode.name + " Grade Scale  - Photon",
      gradeMode: GradeMode,
      active: {
        terms: true
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
  models.GradeScale.findAll({
    where: {
      grade_mode_id: req.params.grade_mode_id,
      deleted: false
    }
  }).then((grades) => {
    json['data'] = grades;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('grade_letter', 'Please enter a grade letter.').notEmpty();
  req.checkBody('grade_point', 'Please enter a correct grade point.').notEmpty().isFloat({ min: 0, max: 4 });
  req.checkBody('min_percents', 'Please enter a correct percentage.').notEmpty().isFloat({ min: 0, max: 100 });

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  let params = JSON.parse(JSON.stringify({
    grade_mode_id: req.params.grade_mode_id
  }));

  Object.assign(params, req.body);

  models.GradeScale.build(
    params
  ).save().then(GradeScale => {
    if (!GradeScale) throw new Error('Failed to save grade.');
    return models.GradeScale.findOne({ where: { id: GradeScale.id } })
  }).then(GradeScale => {
    if (!GradeScale) throw new Error('Grade not found.');
    return res.status(200).json(GradeScale);
  }).catch(err => {
    return res.status(501).send('Failed to save grade.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('grade_letter', 'Please enter a grade letter.').notEmpty();
  req.checkBody('grade_point', 'Please enter a correct grade point.').notEmpty().isFloat({ min: 0, max: 4 });
  req.checkBody('min_percents', 'Please enter a correct percentage.').notEmpty().isFloat({ min: 0, max: 100 });

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  models.GradeScale.update(
    req.body,
    { where: { id: req.params.id } }
  ).then(result => {
    return models.GradeScale.findOne({ where: { id: req.params.id } })
  }).then((GradeScale) => {
    if (!GradeScale) throw new Error('Grade not found.');
    return res.status(200).json(GradeScale);
  }).catch(err => {
    return res.status(501).send('Failed to edit grade.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.GradeScale.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Grade successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete grade.');
  });
});

module.exports = router;