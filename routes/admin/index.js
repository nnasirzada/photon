const express = require("express");
const passport = require("passport");
const router = express.Router();

router.all("/*", (req, res, next) => {
  //if (!req.isAuthenticated() || req.user.type != "admin")
  //res.redirect("/auth/login/");
  req.app.locals.layout = "admin/layout";
  next();
});

router.get("/", (req, res, next) => {
  res.redirect('/admin/buildings/');
});

router.use("/buildings/", require("./buildings.js"));
router.use("/grade-modes/", require("./grade-modes.js"));
router.use("/majors/", require("./majors.js"));
router.use("/programs/", require("./programs.js"));
router.use("/buildings/:building_id/rooms/", require("./rooms.js"));
router.use("/schedule-types/", require("./schedule-types.js"));
router.use("/schools/", require("./schools.js"));
router.use("/subjects/", require("./subjects.js"));

module.exports = router;