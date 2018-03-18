const express = require('express');
const passport = require('passport');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
	models.Instructor.getTeachingTerms(req.user.id).then(terms => {
		res.render("instructor/classes", {
			title: "Select a term - Instructor Dashboard",
			active: {
				classes: true
			},
			imports: {
				uikit: true
			},
			resultFound: terms.length > 0,
			result: terms
		});
	}).catch(console.error);
});

router.get('/:termId', (req, res, next) => {
	models.Instructor.getTeachingClasses(req.user.id, req.params.termId).then(classes => {
		res.render("instructor/classes/by-term", {
			title: "Classes - Instructor Dashboard",
			active: {
				classes: true
			},
			imports: {
				uikit: true
			},
			resultFound: classes.length > 0,
			result: classes,
			termId: req.params.termId
		});
	}).catch(console.error);
});

// router.get('/:termId/:classId', (req, res, next) => {
// 	models.Instructor.getTeachingClasses(req.user.id, req.params.termId).then(classes => {
// 		res.render("instructor/classes/homepage", {
// 			title: "Classes - Instructor Dashboard",
// 			active: {
// 				classes: true
// 			},
// 			imports: {
// 				uikit: true
// 			},
// 			classFound: classes.length > 0,
// 			classes: classes
// 		});
// 	}).catch(console.error);
// })

module.exports = router;