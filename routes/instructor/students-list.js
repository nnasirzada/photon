const express = require('express');
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
	res.render('instructor/classes/students-list', {
		title: 'List of Enrolled Students',
		active: {
			classes: true
		},
		imports: {
			jquery: true,
			jquery_ui: true,
			uikit: true,
			data_tables: true
		}
	});
});

router.get('/all', (req, res, next) => {
	models.sequelize.query("SELECT s.user_id AS `student_id`, u.firstname, u.lastname, u.patronymic, u.email, m.code AS `major`, ce.status FROM(SELECT ce.student_id, ce.status FROM class_enrollment ce LEFT JOIN class c ON ce.class_id = c.id WHERE c.instructor_id = ? AND ce.class_id = ? AND ce.status != 'dropped' AND ce.deleted = 0) ce LEFT JOIN student s ON ce.student_id = s.user_id LEFT JOIN user u ON s.user_id = u.id LEFT JOIN major m ON s.major_id = m.id WHERE s.deleted = 0", {
		replacements: [req.user.id, req.params.classId],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		let json = {};
		json['data'] = values;
		res.status(200).json(json);
	}).catch(console.error);
});

module.exports = router;