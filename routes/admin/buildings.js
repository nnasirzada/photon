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

module.exports = router;