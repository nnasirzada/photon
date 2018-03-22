const express = require("express");
const passport = require("passport");
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get("/", (req, res, next) => {

  models.Building.findOne({
    where: {
      id: req.params.building_id,
      deleted: false
    }
  }).then((Building) => {
    if (!Building) throw new Error('Building not found.');

    res.render("admin/rooms", {
      title: Building.name + " Rooms - Photon",
      building: Building,
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

  }).catch(err => {
    res.locals.error = err;
    res.status(err.status || 500);
    return res.render('error', { layout: false });
  });
});

router.get('/all', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Room.findAll({
    where: {
      building_id: req.params.building_id,
      deleted: false
    }
  }).then((rooms) => {
    json['data'] = rooms;
    res.status(200).json(json);
  }).catch(console.log);
});

router.get('/search/:keyword', (req, res, next) => {
  let json = {};
  json['data'] = [];
  models.Room.findAll({
    where: {
      deleted: false,
      [models.Sequelize.Op.or]: [
        {
          code: {
            [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
          }
        },
        {
          name: {
            [models.Sequelize.Op.like]: '%' + req.params.keyword + '%',
          }
        }
      ]
    }
  }).then((rooms) => {
    json['data'] = rooms;
    res.status(200).json(json);
  }).catch(console.log);
});

router.post('/', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Room.build({
    'code': req.body.code,
    'name': req.body.name,
    'building_id': req.params.building_id

  }).save().then((Room) => {
    if (!Room) throw new Error('Failed to save room.');
    return res.status(200).json(Room);

  }).catch(err => {
    return res.status(501).send('Failed to save room.');
  });
});

router.put('/:id', (req, res, next) => {

  req.checkBody('code', null).notEmpty();
  req.checkBody('name', null).notEmpty();

  if (req.validationErrors())
    return res.status(501).send('Form is incomplete.');

  models.Room.update(
    { code: req.body.code, name: req.body.name },
    { where: { id: req.params.id } }

  ).then(result => {
    return models.Room.findOne({ where: { id: req.params.id } });

  }).then((Room) => {
    if (!Room) throw new Error('Room not found.');
    return res.status(200).json(Room);

  }).catch(err => {
    return res.status(501).send('Failed to edit room.');
  });
});

router.delete('/:id', (req, res, next) => {

  models.Room.update(
    { deleted: true },
    { where: { id: req.params.id } }
  ).then(result => {
    return res.status(200).send('Room successfully deleted.');
  }).catch(err => {
    return res.status(501).send('Failed to delete room.');
  });
});

module.exports = router;