const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
	models.Instructor.getTeachingTerms(req.user.id).then(terms => {
		res.render('instructor/classes', {
			title: 'Select a term',
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

router.get('/term/:termId', (req, res, next) => {
	models.Instructor.getTeachingClasses(req.user.id, req.params.termId).then(classes => {
		res.render('instructor/classes/by-term', {
			title: 'Select a class',
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

router.get('/class/:classId', (req, res, next) => {
	Promise.all([
		models.sequelize.query("SELECT a.id AS `class_id`, a.section, c.number AS `course_number`, c.name AS `course_name`, c.description AS `course_description`, g.name AS `grade_mode_name`, st.name AS `schedule_type_name`, s.code AS `subject_code`, s.name AS `subject_name`, sc.name AS `school_name`, CONCAT(t.name, ' - ', pot.name) AS `term_name`, DATE_FORMAT(pot.start_date, '%c/%d/%Y') AS `start_date`, DATE_FORMAT(pot.end_date, '%c/%d/%Y') AS `end_date` FROM (SELECT * FROM class WHERE id = ? AND instructor_id = ?) a LEFT JOIN course c ON a.course_id = c.id LEFT JOIN grade_mode g ON c.grade_mode_id = g.id LEFT JOIN schedule_type st ON c.schedule_type_id = st.id LEFT JOIN subject s ON c.subject_id = s.id LEFT JOIN school sc ON c.school_id = sc.id LEFT JOIN part_of_term pot ON a.part_of_term_id = pot.id LEFT JOIN term t ON pot.term_id = t.id", {
			replacements: [req.params.classId, req.user.id],
			type: models.sequelize.QueryTypes.SELECT
		}),
		models.sequelize.query('SELECT cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, cm.start_time, cm.end_time, r.code AS `room_code`, r.name AS `room_name`, b.code AS `building_code`, b.name AS `building_name` FROM (SELECT cm.* FROM class_meeting cm LEFT JOIN class c ON cm.class_id = c.id WHERE c.id = ? AND c.instructor_id = ?) cm LEFT JOIN room r ON cm.room_id = r.id LEFT JOIN building b ON r.building_id = b.id', {
			replacements: [req.params.classId, req.user.id],
			type: models.sequelize.QueryTypes.SELECT
		})
	]).then(values => {
		console.log(values);
		res.render('instructor/classes/homepage', {
			title: values[0][0] ? values[0][0].course_name : 'No class information',
			active: {
				classes: true
			},
			imports: {
				uikit: true
			},
			classDetailsFound: values[0].length > 0,
			classDetails: values[0][0],
			classMeetingsFound: values[1].length > 0,
			classMeetings: values[1]
		});
	}).catch(console.error);
});

router.get('/class/:classId/students-list', (req, res, next) => {
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

router.get('/class/:classId/students-list/all', (req, res, next) => {
	models.sequelize.query("SELECT s.user_id AS `student_id`, u.firstname, u.lastname, u.patronymic, u.email, m.code AS `major`, ce.status FROM (SELECT ce.student_id, ce.status FROM class_enrollment ce LEFT JOIN class c ON ce.class_id = c.id WHERE c.instructor_id = ? AND ce.class_id = ? AND ce.status != 'dropped') ce LEFT JOIN student s ON ce.student_id = s.user_id LEFT JOIN user u ON s.user_id = u.id LEFT JOIN major m ON s.major_id = m.id", {
		replacements: [req.user.id, req.params.classId],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		let json = {};
		json['data'] = values;
		res.status(200).json(json);
	}).catch(console.error);
});


module.exports = router;