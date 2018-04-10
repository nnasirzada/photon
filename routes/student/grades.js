const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {
        res.render('student/grades', {
            title: 'Select a Term',
            active: {
                grades: true
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
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = '';
        let isCorrect = false;

        let i = 0;
        for (i; i < terms.length; i++) {
            if (terms[i].id == req.params.termId) {
                termName = terms[i].name;
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            res.render("student/grades/classes-by-term", {
                title: "Enrolled Classes in " + termName,
                term_id_ajax: req.params.termId,
                active: {
                    grades: true
                },
                imports: {
                    jquery: true,
                    jquery_ui: true,
                    uikit: true,
                    data_tables: true
                }
            });
        } else {
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }

    }).catch(console.error);
});

router.get('/term/:termId/enrolled_classes', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getEnrolledClassesByTerm(req.user.id, req.params.termId).then(classes => {

        let i = 0;
        for (i; i < classes.length; i++) {
            classes[i].title = classes[i].subject_code + " " + classes[i].course_number + " - " + classes[i].course_name;
        }

        json['data'] = classes;
        res.status(200).json(json);
    }).catch(console.log);
});

// Select a class page
router.get('/term/:termId/class/:classId', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = '';
        let isCorrect = false;

        let i = 0;
        for (i; i < terms.length; i++) {
            if (terms[i].id == req.params.termId) {
                termName = terms[i].name;
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            Promise.all([
                models.sequelize.query("SELECT t.id as term_id, a.id AS `class_id`, a.section, c.number AS `course_number`, c.name AS `course_name`, c.description AS `course_description`, g.name AS `grade_mode_name`, st.name AS `schedule_type_name`, s.code AS `subject_code`, s.name AS `subject_name`, sc.name AS `school_name`, Concat(t.name, ' - ', pot.name) AS `term_name`, Date_format(pot.start_date, '%c/%d/%Y') AS `start_date`, Date_format(pot.end_date, '%c/%d/%Y') AS `end_date` FROM(SELECT * FROM class WHERE id = ? AND deleted = false and id in (select class_id from class_enrollment WHERE deleted = false and student_id = ?)) a JOIN course c ON c.deleted = false and a.course_id = c.id JOIN grade_mode g ON g.deleted = false and c.grade_mode_id = g.id JOIN schedule_type st ON st.deleted = false and c.schedule_type_id = st.id JOIN subject s ON s.deleted = false and c.subject_id = s.id JOIN school sc ON sc.deleted = false and c.school_id = sc.id JOIN part_of_term pot ON pot.deleted = false and a.part_of_term_id = pot.id and pot.term_id = ? JOIN term t ON t.deleted = false and pot.term_id = t.id", {
                    replacements: [req.params.classId, req.user.id, req.params.termId],
                    type: models.sequelize.QueryTypes.SELECT
                }),
                models.sequelize.query("SELECT cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, cm.start_time, cm.end_time, r.code AS `room_code`, r.name AS `room_name`, b.code AS `building_code`, b.name AS `building_name` FROM(SELECT cm.* FROM class_meeting cm LEFT JOIN class c ON c.deleted = false and cm.class_id = c.id WHERE c.id = ? AND cm.deleted = 0) cm LEFT JOIN room r ON r.deleted = false and cm.room_id = r.id LEFT JOIN building b ON b.deleted = false and r.building_id = b.id", {
                    replacements: [req.params.classId],
                    type: models.sequelize.QueryTypes.SELECT
                })
            ]).then(values => {
                res.render('student/grades/class-details', {
                    title: values[0][0] ? values[0][0].course_name : 'No class information',
                    active: {
                        grades: true
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
        } else {
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }

    }).catch(console.error);
});

router.get('/term/:termId/class/:classId/view_grades', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = '';
        let isTermCorrect = false;

        let i = 0;
        for (i; i < terms.length; i++) {
            if (terms[i].id == req.params.termId) {
                termName = terms[i].name;
                isTermCorrect = true;
                break;
            }
        }

        if (isTermCorrect) {
            models.Student.getEnrolClassIds(req.user.id, req.params.termId).then(classids => {
                let isClassIdCorrect = false;

                let i = 0;
                for (i; i < classids.length; i++) {
                    if (classids[i].class_id == req.params.classId) {
                        isClassIdCorrect = true;
                        break;
                    }
                }

                if (isClassIdCorrect) {
                    models.Course.getCourseDetailsByClassId(req.params.classId).then(courses => {
                        if (courses[0]) {
                            let courseDetails = courses[0].code + " " + courses[0].number + " - " + courses[0].name + " (Section: " + courses[0].section + ")";
                            res.render("student/grades/view-grades", {
                                title: "Grade components for " + courseDetails,
                                term_id_ajax: req.params.termId,
                                class_id_ajax: req.params.classId,
                                active: {
                                    grades: true
                                },
                                imports: {
                                    jquery: true,
                                    jquery_ui: true,
                                    uikit: true,
                                    data_tables: true
                                }
                            });
                        } else {
                            let err = new Error('Not Found');
                            err.status = 404;
                            res.locals.error = err;
                            res.status(err.status);
                            return res.render('error', {layout: false});
                        }
                    }).catch(console.error);
                } else {
                    let err = new Error('Not Found');
                    err.status = 404;
                    res.locals.error = err;
                    res.status(err.status);
                    return res.render('error', {layout: false});
                }

            });
        } else {
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }

    }).catch(console.error);
});

router.get('/term/:termId/class/:classId/grades', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getGradeComponentsByClassId(req.params.classId, req.user.id).then(components => {
        json['data'] = components;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;