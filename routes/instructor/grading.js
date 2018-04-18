const express = require('express');
const moment = require('moment');
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
	models.sequelize.query("SELECT gc.* FROM grade_component gc INNER JOIN class c ON gc.class_id = c.id WHERE gc.class_id = ? AND c.instructor_id = ? AND gc.deleted = 0", {
		replacements: [req.params.classId, req.user.id],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		if (!values[0]) {
			throw new Error('There is no grade component available.');
		}

		res.render('instructor/classes/grading', {
			title: 'Grading',
			active: {
				classes: true
			},
			imports: {
				jquery: true,
				jquery_ui: true,
				uikit: true
			},
			gradeComponents: values
		});
	}).catch(err => {
		res.locals.error = err;
		res.status(err.status || 500);
		return res.render('error', { layout: false });
	});
});

router.get('/entry/', (req, res, next) => {
	req.checkParams('classId', null).notEmpty().isNumeric();
	req.checkQuery('component', null).notEmpty().isNumeric();

	if (req.validationErrors()) {
		throw new Error('Query params are not valid')
	}

	models.sequelize.query("SELECT A.*, B.name, B.percentage, B.submitted_at, B.updated_at FROM(SELECT ce.student_id, CONCAT(u.firstname, ' ', LEFT(u.patronymic, 1), '. ', u.lastname) AS `student` FROM class_enrollment ce INNER JOIN user u ON ce.student_id = u.id INNER JOIN class c ON ce.class_id = c.id WHERE ce.class_id = ? AND c.instructor_id = ? AND ce.status != 'dropped' AND ce.deleted = 0) A LEFT JOIN (SELECT ge.student_id, gc.name, ge.percentage, DATE_FORMAT(ge.submitted_at, '%b %d, %Y %k:%i') AS `submitted_at`, DATE_FORMAT(ge.updated_at, '%b %d, %Y %k:%i') AS `updated_at` FROM grade_entry ge INNER JOIN grade_component gc ON ge.component_id = gc.id INNER JOIN class c ON gc.class_id = c.id WHERE c.instructor_id = ? AND c.id = ? AND gc.id = ? AND gc.deleted = 0 AND c.deleted = 0) B ON A.student_id = B.student_id", {
		replacements: [req.params.classId, req.user.id, req.user.id, req.params.classId, req.query.component],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		let componentName;
		if (values[0]) {
			componentName = values[0].name;
		}
		res.render('instructor/classes/grade-entry', {
			title: 'Attendance Entry',
			active: {
				classes: true
			},
			imports: {
				jquery: true,
				uikit: true
			},
			result: values,
			componentName: componentName
		})
	}).catch(err => {
		res.locals.error = err;
		res.status(err.status || 500);
		return res.render('error', { layout: false });
	});
});

router.post('/entry', (req, res, next) => {
	req.checkParams('classId', null).notEmpty().isNumeric();
	req.checkQuery('component', null).notEmpty().isNumeric();
	req.checkBody('student', null).notEmpty();

	if (req.validationErrors()) {
		throw new Error('Query params are not valid')
	}

	models.PartOfTerm.isOpenToEdits(req.params.classId, req.user.id).then(result => {
		if (result[0] && !result[0].open_to_edits) {
			throw new Error('Term is not open to edits');
		}

		let data = req.body.student.map((element) => {
			return new Promise((resolve) => {
				element.id = element.id || 0;
				element.percentage = element.percentage || null;

				if (element.id && element.percentage) {
					models.sequelize.query("INSERT INTO grade_entry (student_id, component_id, percentage) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE percentage = ?", {
						replacements: [element.id, req.query.component, element.percentage, element.percentage],
						type: models.sequelize.QueryTypes.INSERT
					}).then(values => resolve(values));
				} else {
					resolve();
				}
			});
		});

		Promise.all(data).then(values => {
			return res.status(200).send('Saved successfully.');
		}).catch(err => {
			return res.status(501).send('Error happened');
		});
	}).catch(err => {
		return res.status(501).send('Error happened');
	});
})

module.exports = router;