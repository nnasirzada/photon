const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/terms", {
    title: "Terms - Photon",
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
});

router.get('/all', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Term.findAll({
    where: { deleted: false }
  }).then((terms) => {
    json['data'] = terms;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('year', 'Please select a correct year.').notEmpty().isNumeric({ min: 2010, max: 2100 }).isLength({ min: 4, max: 4 });
  req.checkBody('season', 'Please select a correct season.').notEmpty().isIn(['spring', 'summer', 'fall', 'other']);
  req.checkBody('start_date', 'Please select a start date.').notEmpty();
  req.checkBody('end_date', 'Please select an end date.').notEmpty();
  req.checkBody('name', 'Please enter a name.').notEmpty();
  req.checkBody('status', 'Please select a correct status.').notEmpty().isIn(['hidden', 'view only', 'open']);

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  models.Term.build(
    req.body

  ).save().then((Term) => {
    if (!Term) throw new Error('Failed to save term.');
    return res.status(200).json(Term);

  }).catch(err => {
    return res.status(501).send('Failed to save term.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('year', 'Please select a correct year.').notEmpty().isNumeric({ min: 2010, max: 2100 }).isLength({ min: 4, max: 4 });
  req.checkBody('season', 'Please select a correct season.').notEmpty().isIn(['spring', 'summer', 'fall', 'other']);
  req.checkBody('start_date', 'Please select a start date.').notEmpty();
  req.checkBody('end_date', 'Please select an end date.').notEmpty();
  req.checkBody('name', 'Please enter a name.').notEmpty();
  req.checkBody('status', 'Please select a correct status.').notEmpty().isIn(['hidden', 'view only', 'open']);

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  models.Term.update(
    req.body,
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Term.findOne({ where: { id: req.params.id } });

  }).then((Term) => {
    if (!Term) throw new Error('Term not found.');
    return res.status(200).json(Term);

  }).catch(err => {
    return res.status(501).send('Failed to edit term.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Term.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Term successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete term.');
  });
});

module.exports = router;