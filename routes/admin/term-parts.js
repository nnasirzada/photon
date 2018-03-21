const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  models.Term.findOne({
    where: {
      id: req.params.term_id,
      deleted: false
    }
  }).then((Term) => {
    if (!Term) throw new Error('Term not found.');

    res.render("admin/term-parts", {
      title: "Parts of " + Term.name + " (" + Term.year + ") - Photon",
      term: Term,
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
  models.PartOfTerm.findAll({
    where: {
      term_id: req.body.term_id,
      deleted: false
    }
  }).then((termParts) => {
    json['data'] = termParts;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('start_date', 'Please select a start date.').notEmpty();
  req.checkBody('end_date', 'Please select an end date.').notEmpty();
  req.checkBody('name', 'Please enter a name.').notEmpty();

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  let params = JSON.parse(JSON.stringify({
    term_id: req.params.term_id
  }));

  Object.assign(params, req.body);

  models.PartOfTerm.build(
    params

  ).save().then((PartOfTerm) => {
    if (!PartOfTerm) throw new Error('Failed to save part of term.');
    return res.status(200).json(PartOfTerm);

  }).catch(err => {
    return res.status(501).send('Failed to save part of term.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('start_date', 'Please select a start date.').notEmpty();
  req.checkBody('end_date', 'Please select an end date.').notEmpty();
  req.checkBody('name', 'Please enter a name.').notEmpty();

  if (req.validationErrors())
    return res.status(501).send(req.validationErrors()[0].msg);

  let params = JSON.parse(JSON.stringify({
    term_id: req.params.term_id
  }));

  Object.assign(params, req.body);

  models.PartOfTerm.update(
    params,
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Term.findOne({ where: { id: req.params.id } });

  }).then((PartOfTerm) => {
    if (!PartOfTerm) throw new Error('Part of term not found.');
    return res.status(200).json(PartOfTerm);

  }).catch(err => {
    return res.status(501).send('Failed to edit part of term.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.PartOfTerm.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Part of term successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete part of term.');
  });
});

module.exports = router;