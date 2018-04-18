const express = require('express');
const models = require('../../models');
const moment = require('moment');
const RRule = require('rrule').RRule
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
	models.sequelize.query("SELECT cm.*, pot.start_date, pot.end_date FROM class_meeting cm INNER JOIN class c ON cm.class_id = c.id INNER JOIN part_of_term pot ON c.part_of_term_id = pot.id WHERE c.instructor_id = ? AND cm.class_id = ? AND pot.deleted = 0 AND c.deleted = 0 AND cm.deleted = 0", {
		replacements: [req.user.id, req.params.classId],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		if (!values[0]) {
			throw new Error('No class meeting found');
		}

		let meetingTimes = [],
			meetingDates = [];

		values.forEach(element => {
			let startDate = element.start_date,
				endDate = element.end_date,
				byweekday = [];

			meetingTimes[element.id] = {};
			meetingTimes[element.id].optionValue = element.id;
			meetingTimes[element.id].optionText = '';

			if (element.monday) {
				byweekday.push(RRule.MO);
				meetingTimes[element.id].optionText = 'Monday';
			}
			if (element.tuesday) {
				byweekday.push(RRule.TU);
				meetingTimes[element.id].optionText += ' Tuesday';
			}
			if (element.wednesday) {
				byweekday.push(RRule.WE);
				meetingTimes[element.id].optionText += ' Wednesday';
			}
			if (element.thursday) {
				byweekday.push(RRule.TH);
				meetingTimes[element.id].optionText += ' Thursday';
			}
			if (element.friday) {
				byweekday.push(RRule.FR);
				meetingTimes[element.id].optionText += ' Friday';
			}
			if (element.saturday) {
				byweekday.push(RRule.SA);
				meetingTimes[element.id].optionText += ' Saturday';
			}
			if (element.sunday) {
				byweekday.push(RRule.SU);
				meetingTimes[element.id].optionText += ' Sunday';
			}

			meetingTimes[element.id].optionText += ' ' + element.start_time + ' - ' + element.end_time;
			meetingTimes[element.id].optionText.trim();

			let rule = new RRule({
				freq: RRule.WEEKLY,
				byweekday: byweekday,
				dtstart: new Date(startDate + ' ' + element.start_time),
				until: new Date(endDate)
			});

			meetingDates[element.id] = [];

			rule.all((date, index) => {
				return meetingDates[element.id].push({
					optionValue: moment(date).format('YYYY-MM-DD'),
					optionText: moment(date).format('MMMM DD, YYYY')
				});
			});
		});

		res.render('instructor/classes/attendance', {
			title: 'Attendance',
			active: {
				classes: true
			},
			imports: {
				jquery: true,
				jquery_ui: true,
				uikit: true
			},
			meetingTimes: meetingTimes,
			meetingDates: JSON.stringify(meetingDates) || '{}'
		});
	}).catch(err => {
		res.locals.error = err;
		res.status(err.status || 500);
		return res.render('error', { layout: false });
	});
});

router.get('/entry', (req, res, next) => {
	req.checkParams('classId', null).notEmpty().isNumeric();
	req.checkQuery('meetingtime', null).notEmpty().isNumeric();
	req.checkQuery('meetingdate', null).notEmpty();

	if (req.validationErrors() || !moment(req.query.meetingdate, 'YYYY-MM-DD', true).isValid()) {
		throw new Error('Query params are not valid')
	}

	models.sequelize.query("SELECT A.*, B.date, B.status, B.note FROM(SELECT ce.student_id, Concat(u.firstname, ' ', LEFT(u.patronymic, 1), '. ', u.lastname) AS `student` FROM class_enrollment ce INNER JOIN user u ON ce.student_id = u.id INNER JOIN class c ON ce.class_id = c.id INNER JOIN class_meeting cm ON c.id = cm.class_id WHERE ce.class_id = ? AND cm.id = ? AND c.instructor_id = ? AND ce.status != 'dropped' AND ce.deleted = 0) A LEFT JOIN (SELECT student_id, `date`, status, note FROM class_attendance WHERE class_id = ? AND class_meeting_id = ? AND `date` = ? AND deleted = 0) B ON A.student_id = B.student_id ORDER BY A.student ASC", {
		replacements: [req.params.classId, req.query.meetingtime, req.user.id, req.params.classId, req.query.meetingtime, req.query.meetingdate],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		values.forEach(element => {
			switch (element.status) {
				case 'absent':
					element.absent = true;
					break;
				case 'present':
					element.present = true;
					break;
				case 'excused':
					element.excused = true;
					break;
			}
			return element;
		});

		res.render('instructor/classes/attendance-entry', {
			title: 'Attendance Entry',
			active: {
				classes: true
			},
			imports: {
				jquery: true,
				uikit: true
			},
			result: values,
			meetingDate: moment(req.query.meetingdate).format('MMMM DD, YYYY').toString()
		})
	}).catch(err => {
		res.locals.error = err;
		res.status(err.status || 500);
		return res.render('error', { layout: false });
	});
});

router.post('/entry', (req, res, next) => {
	req.checkParams('classId', null).notEmpty().isNumeric();
	req.checkQuery('meetingtime', null).notEmpty().isNumeric();
	req.checkQuery('meetingdate', null).notEmpty();
	req.checkBody('student', null).notEmpty();

	models.PartOfTerm.isOpenToEdits(req.params.classId, req.user.id).then(result => {
		if (result[0] && !result[0].open_to_edits) {
			throw new Error('Term is not open to edits');
		}

		let data = req.body.student.map((element) => {
			return new Promise((resolve) => {
				element.id = element.id || 0;
				element.status = element.status || null;
				element.note = element.note || null;

				if (element.id && element.status) {
					models.sequelize.query("INSERT INTO class_attendance (`date`, class_id, class_meeting_id, student_id, status, note) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = ?, note = ?", {
						replacements: [req.query.meetingdate, req.params.classId, req.query.meetingtime, element.id, element.status, element.note, element.status, element.note],
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
});

module.exports = router;