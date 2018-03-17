const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("admin/buildings", {
    title: "Buildings - Photon",
    active: {
      buildings: true
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
  models.Building.findAll().then((buildings) => {
    json['data'] = buildings;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/:id', (req, res, next) => {
  models.Building.findOne({
    where: { id: req.params.id }
  }).then((Building) => {
    if (!Building) {
      res.status(501).send('Failed to edit.');
    } else {
      models.Building.update({ code: req.body.code, name: req.body.name }, {
        where: { id: Building.id }
      }).then(result => {
        models.Building.findOne({
          where: { id: req.params.id }
        }).then((Building) => {
          res.status(200).json(Building);
        }).catch(err => {
          res.status(501).send('Failed to edit.');
        });
      }).catch(err => {
        res.status(501).send('Failed to edit.');
      });
    }
  }).catch(err => {
    res.status(501).send('Failed to edit.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Building.findOne({ where: { id: req.params.id } }).then((Building) => {

    if (!Building) {
      res.status(501).send('Failed to delete.');
    } else {
      models.Building.destroy({
        where: { id: Building.id }
      }).then(result => {
        res.status(200).send('Successfully deleted.');
      }).catch(err => {
        res.status(501).send('Failed to delete.');
      });
    }
  }).catch(err => {
    res.status(501).send('Failed to delete.');
  });
});

module.exports = router;