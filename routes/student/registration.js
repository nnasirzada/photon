const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Term.findAll({ where: { deleted: false, status: 'open' } }).then(terms => {
        res.render("student/registration", {
            title: "Registration",
            active: {
                registration: true
            },
            imports: {
                uikit: true
            },
            resultFound: terms.length > 0,
            result: terms
        });
    }).catch(err => {
        res.locals.error = err;
        res.status(err.status || 500);
        return res.render('error', { layout: false });
    });
});

router.get('/term/:term_id', (req, res, next) => {
    models.Term.findOne({ where: { deleted: false, id: req.params.term_id } }).then(Term => {
        if (Term.status === 'open') {
            res.render("student/registration/search", {
                title: "Registration",
                term: Term,
                active: {
                    registration: true
                },
                imports: {
                    uikit: true,
                    jquery: true,
                    jquery_ui: true,
                },
            });
        } else {
            let err = new Error('Term Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', { layout: false });
        }
    }).catch(err => {
        res.locals.error = err;
        res.status(err.status || 500);
        return res.render('error', { layout: false });
    });
});

router.get('/search_subjects/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Subject.findAll({
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
    }).then((subjects) => {
        json['data'] = subjects;
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:term_id/search', (req, res, next) => {
    models.Term.findOne({ where: { deleted: false, id: req.params.term_id } }).then(Term => {
        if (Term.status === 'open') {
            models.Class.findAll({
                where: { deleted: false },
                include: [{
                    model: models.Course,
                    attributes: ['id', 'name', 'number', 'credit_hours'],
                    required: true,
                    include: [{
                        model: models.Subject,
                        attributes: ['code'],
                        required: true
                    }],
                    where: {
                        name: {
                            [models.Sequelize.Op.like]: '%' + req.query.keyword + '%',
                        },
                        number: {
                            [models.Sequelize.Op.like]: '%' + req.query.course_number + '%',
                        },
                        subject_id: req.query.subject_id ? req.query.subject_id : { [models.Sequelize.Op.ne]: null }
                    }
                }, {
                    model: models.User,
                    attributes: ['firstname', 'lastname'],
                    required: true
                }, {
                    model: models.ClassMeeting,
                    required: false,
                    include: [
                        {
                            model: models.Room,
                            attributes: ['code'],
                            required: true,
                            include: [{
                                model: models.Building,
                                attributes: ['code'],
                                required: true
                            }]
                        }
                    ]
                }, {
                    model: models.ClassEnrollment,
                    attributes: ['student_id'],
                    required: false
                }, {
                    model: models.PartOfTerm,
                    required: true,
                    where: {
                        term_id: req.params.term_id
                    }
                }]
            }).then(classes => {
                res.render("student/registration/classes", {
                    title: "Enroll to Classes - " + Term.name,
                    term_id: req.params.term_id,
                    user_id: req.user.id,
                    query: req.query,
                    classes: JSON.stringify(classes),
                    active: {
                        registration: true
                    },
                    imports: {
                        uikit: true,
                        jquery: true,
                        jquery_ui: true,
                        data_tables: true
                    },
                });
            });
        } else {
            let err = new Error('Term Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', { layout: false });
        }
    }).catch(err => {
        res.locals.error = err;
        res.status(err.status || 500);
        return res.render('error', { layout: false });
    });
});

router.post('/term/:term_id/search', (req, res, next) => {

    var enrolls;
    var finished = false;

    models.ClassEnrollment.findAll({
        where: {
            deleted: false,
            student_id: req.user.id
        },
        include: [
            {
                model: models.Class,
                required: true,
                include: [
                    {
                        model: models.PartOfTerm,
                        required: true
                    },
                    {
                        model: models.Course,
                        required: true
                    },
                    {
                        model: models.ClassMeeting,
                        required: false
                    }
                ]
            }
        ]
    }).then(enrollments => {

        // check credit hours
        var credits = 0;
        enrollments.forEach(enrollment => {
            if (enrollment.Class.PartOfTerm.term_id == req.params.term_id)
                credits += parseInt(enrollment.Class.Course.credit_hours, 10);
        });
        if (credits + parseInt(req.body.credit_hours, 10) > 38) {
            finished = true;
            return res.status(501).send('Credit hours exceeded.');
        }

        enrolls = enrollments;
        return models.CoursePrerequisite.findAll({
            where: {
                deleted: false,
                course_id: req.body.course_id
            },
            include: [
                {
                    model: models.Course,
                    required: true
                }
            ]
        });

    }).then(prerequisites => {
        if (finished) return;

        // check prerequisites
        var prerequisiteIssue = null;
        prerequisites.forEach(prerequisite => {
            var yup = false;
            enrolls.forEach(enroll => {
                if (prerequisite.prerequisite_id == enroll.Class.course_id && (enroll.status == 'ongoing' || enroll.status == 'passed')) {
                    yup = true;
                }
            });
            if (!yup) prerequisiteIssue = prerequisite;
        });
        if (prerequisiteIssue != null) {
            finished = true;
            return res.status(501).send('Prerequisite issue: ' + prerequisiteIssue.Course.name);
        }

        return models.Class.findOne({
            where: {
                id: req.body.class_id
            },
            include: [
                {
                    model: models.PartOfTerm,
                    required: true
                },
                {
                    model: models.ClassMeeting,
                    required: false
                },
                {
                    model: models.ClassEnrollment,
                    attributes: ['id'],
                    required: false
                }
            ]
        });

    }).then(the_class => {
        if (finished) return;

        // check schedule
        enrolls.forEach(enroll => {
            enroll.Class.ClassMeetings.forEach(meeting => {
                the_class.ClassMeetings.forEach(the_meeting => {
                    if (enroll.Class.PartOfTerm.start_date <= the_class.PartOfTerm.end_date
                        && enroll.Class.PartOfTerm.end_date >= the_class.PartOfTerm.start_date
                        && meeting.start_time <= the_meeting.end_time && meeting.end_time >= the_meeting.start_time
                        && ((meeting.monday == true && the_meeting.monday == true)
                            || (meeting.tuesday == true && the_meeting.tuesday == true)
                            || (meeting.wednesday == true && the_meeting.wednesday == true)
                            || (meeting.thursday == true && the_meeting.thursday == true)
                            || (meeting.friday == true && the_meeting.friday == true)
                            || (meeting.saturday == true && the_meeting.saturday == true)
                            || (meeting.sunday == true && the_meeting.sunday == true))) {
                        finished = true;
                        return res.status(501).send('Time conflict: ' + enroll.Class.Course.name);
                    }
                });
            });
        });

        // check available seats
        if (the_class.ClassEnrollments.length >= the_class.max_enrollment) {
            finished = true;
            return res.status(501).send('No seat available.');
        }

        if (!finished) {
            // enroll
            return models.ClassEnrollment.build({
                student_id: req.user.id,
                class_id: req.body.class_id,
            }).save();
        }

    }).then(result => {
        if (finished) return;
        return res.status(200).send('Successfully enrolled.');
    }).catch(err => {
        if (finished) return;
        console.log(err);
        return res.status(501).send('Something went wrong.');
    });
});

router.delete('/term/:term_id/search', (req, res, next) => {
    models.ClassEnrollment.destroy(
        { where: { student_id: req.user.id, class_id: req.body.class_id } }
    ).then(result => {
        return res.status(200).send('Successfully dropped.');
    }).catch(err => {
        return res.status(501).send('Failed to drop.');
    });
});

module.exports = router;