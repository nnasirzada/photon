const express = require("express");
const passport = require("passport");
const router = express.Router();

router.all("/*", (req, res, next) => {
  if (!req.isAuthenticated() || req.user.type != "admin")
    return res.redirect("/auth/login/");
  req.app.locals.layout = "admin/layout";
  next();
});

router.get("/", (req, res, next) => {
  res.redirect('/admin/buildings/');
});

router.use("/users/admins/", require("./admins.js"));
router.use("/buildings/", require("./buildings.js"));
router.use("/classes/", require("./classes.js"));
router.use("*/courses/:course_id/classes/", require("./classes.js"));
router.use("*/parts/:part_of_term_id/classes/", require("./classes.js"));
router.use("*/instructors/:instructor_id/classes/", require("./classes.js"));
router.use("/schools/:school_id/courses/", require("./courses.js"));
router.use("/subjects/:subject_id/courses/", require("./courses.js"));
router.use("/programs/:program_id/courses/", require("./courses.js"));
router.use("/courses/", require("./courses.js"));
router.use("/grade-modes/", require("./grade-modes.js"));
router.use("/grade-modes/:grade_mode_id/scale/", require("./grade-scale.js"));
router.use("/users/instructors/", require("./instructors.js"));
router.use("/majors/", require("./majors.js"));
router.use("*/classes/:class_id/meetings/", require("./meetings.js"));
router.use("*/courses/:course_id/prerequisites/", require("./prerequisites.js"));
router.use("/profile/", require("./profile.js"));
router.use("/programs/", require("./programs.js"));
router.use("/buildings/:building_id/rooms/", require("./rooms.js"));
router.use("/schedule-types/", require("./schedule-types.js"));
router.use("/schools/", require("./schools.js"));
router.use("/users/students/", require("./students.js"));
router.use("/subjects/", require("./subjects.js"));
router.use("/terms/:term_id/parts/", require("./term-parts.js"));
router.use("/terms/", require("./terms.js"));

module.exports = router;