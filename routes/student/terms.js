const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {
        res.render('student/terms', {
            title: 'Terms',
            active: {
                terms: true
            },
            imports: {
                uikit: true
            },
            result_found: terms.length > 0,
            result: terms
        });
    }).catch(console.error);
});

router.get('/:term_id/classes/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = null;
        let termFound = false;

        let i = 0;
        for (i; i < terms.length; i++)
            if (terms[i].id == req.params.term_id) {
                termName = terms[i].name;
                termFound = true;
                break;
            }

        if (termFound) {
            res.render("student/classes", {
                title: "Classes - " + termName,
                term_id: req.params.term_id,
                active: {
                    grades: true
                },
                imports: {
                    uikit: true,
                    jquery: true,
                    jquery_ui: true,
                    data_tables: true
                }
            });
        } else {
            let err = new Error('Term Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', { layout: false });
        }
    }).catch(console.error);
});

router.get('/:term_id/classes/all', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getEnrolledClasses(req.user.id, req.params.term_id).then(classes => {
        let i = 0;
        for (i; i < classes.length; i++) {
            classes[i].title = classes[i].subject_code + " " + classes[i].course_number + " - " + classes[i].course_name;
        }
        json['data'] = classes;
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/:term_id/classes/:class_id', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = null;
        let termFound = false;

        let i = 0;
        for (i; i < terms.length; i++)
            if (terms[i].id == req.params.term_id) {
                termName = terms[i].name;
                termFound = true;
                break;
            }

        if (termFound) {
            Promise.all([
                models.sequelize.query("SELECT t.id as term_id, a.id AS `class_id`, a.section, c.number AS `course_number`, c.name AS `course_name`, c.description AS `course_description`, g.name AS `grade_mode_name`, st.name AS `schedule_type_name`, s.code AS `subject_code`, s.name AS `subject_name`, sc.name AS `school_name`, Concat(t.name, ' - ', pot.name) AS `term_name`, Date_format(pot.start_date, '%c/%d/%Y') AS `start_date`, Date_format(pot.end_date, '%c/%d/%Y') AS `end_date` FROM(SELECT * FROM class WHERE id = ? AND deleted = false and id in (select class_id from class_enrollment WHERE deleted = false and student_id = ?)) a JOIN course c ON c.deleted = false and a.course_id = c.id JOIN grade_mode g ON g.deleted = false and c.grade_mode_id = g.id JOIN schedule_type st ON st.deleted = false and c.schedule_type_id = st.id JOIN subject s ON s.deleted = false and c.subject_id = s.id JOIN school sc ON sc.deleted = false and c.school_id = sc.id JOIN part_of_term pot ON pot.deleted = false and a.part_of_term_id = pot.id and pot.term_id = ? JOIN term t ON t.deleted = false and pot.term_id = t.id", {
                    replacements: [req.params.class_id, req.user.id, req.params.term_id],
                    type: models.sequelize.QueryTypes.SELECT
                }),
                models.sequelize.query("SELECT cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, TIME_FORMAT(cm.start_time, '%H:%i') as start_time, TIME_FORMAT(cm.end_time, '%H:%i') as end_time, r.code AS `room_code`, r.name AS `room_name`, b.code AS `building_code`, b.name AS `building_name` FROM(SELECT cm.* FROM class_meeting cm LEFT JOIN class c ON c.deleted = false and cm.class_id = c.id WHERE c.id = ? AND cm.deleted = 0) cm LEFT JOIN room r ON r.deleted = false and cm.room_id = r.id LEFT JOIN building b ON b.deleted = false and r.building_id = b.id", {
                    replacements: [req.params.class_id],
                    type: models.sequelize.QueryTypes.SELECT
                })
            ]).then(values => {
                res.render('student/class-page', {
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
            let err = new Error('Term Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', { layout: false });
        }
    }).catch(console.error);
});

router.get('/:term_id/classes/:class_id/grades', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = null;
        let termFound = false;

        let i = 0;
        for (i; i < terms.length; i++)
            if (terms[i].id == req.params.term_id) {
                termName = terms[i].name;
                termFound = true;
                break;
            }

        if (termFound) {
            models.Student.getClasses(req.user.id, req.params.term_id).then(classes => {

                let classFound = false;

                let i = 0;
                for (i; i < classes.length; i++)
                    if (classes[i].class_id == req.params.class_id) {
                        classFound = true;
                        break;
                    }

                if (classFound) {
                    models.Course.getCourse(req.params.class_id).then(courses => {
                        if (courses[0]) {
                            let title = courses[0].code + " " + courses[0].number + " - " + courses[0].name + " - Section " + courses[0].section;
                            models.Student.getFinalGrades(req.user.id, req.params.classId).then(final_grades => {
                                res.render("student/grades", {
                                    title: "Grades - " + title,
                                    final_grade: (final_grades[0]) ? (final_grades[0].final_grade) : 'Not assigned.',
                                    final_percent: (final_grades[0]) ? (final_grades[0].final_percent) : 'Not assigned.',
                                    term_id: req.params.term_id,
                                    class_id: req.params.class_id,
                                    active: {
                                        grades: true
                                    },
                                    imports: {
                                        uikit: true,
                                        jquery: true,
                                        jquery_ui: true,
                                        data_tables: true
                                    }
                                });
                            }).catch(console.error);
                        } else throw new Error('Class Not Found');
                    }).catch(console.error);
                } else throw new Error('Class Not Found');
            });
        } else throw new Error('Term Not Found');
    }).catch(error => {
        let err = new Error(error.message);
        err.status = 404;
        res.locals.error = err;
        res.status(err.status);
        return res.render('error', { layout: false });
    });
});

router.get('/:term_id/classes/:class_id/grades/all', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getGrades(req.user.id, req.params.class_id).then(components => {
        json['data'] = components;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;