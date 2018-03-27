const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Term.findAll({where: {deleted: false, status: 'open'}}).then(terms => {
        res.render("student/registration", {
            title: "Select a Term",
            active: {
                registration: true
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
    models.Term.findOne({where: {deleted: false, id: req.params.termId}}).then(Term => {
        if (Term.status === 'open') {
            res.render("student/registration/search", {
                title: "Search for Classes",
                term_id_search: req.params.termId,
                term_name_search: Term.name,
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
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }
    }).catch(console.error);
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

router.get('/term/:termId/search', (req, res, next) => {
    models.Term.findOne({where: {deleted: false, id: req.params.termId}}).then(Term => {
        if (Term.status === 'open') {
            res.render("student/registration/register-for-classes", {
                reg_class_t_id_ajax: req.params.termId,
                title: "Register for Classes - " + Term.name,
                subject_id_s: req.query.subject_id,
                course_number_s: req.query.course_number,
                keyword_s: req.query.keyword,
                current_student_id_r: req.user.id,
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
        } else {
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }
    }).catch(console.error);
});

router.get('/term/:termId/te', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTerm(req.params.termId, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/co/:courseNum', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeSuCo(req.params.termId, req.params.subjectId, req.params.courseNum, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeSu(req.params.termId, req.params.subjectId, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/co/:courseNum', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeCo(req.params.termId, req.params.courseNum, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeKe(req.params.termId, req.params.keyword, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeSuKe(req.params.termId, req.params.subjectId, req.params.keyword, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/co/:courseNum/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByTeCoKe(req.params.termId, req.params.courseNum, req.params.keyword, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/co/:courseNum/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Class.getRegClassesByAll(req.params.termId, req.params.subjectId, req.params.courseNum, req.params.keyword, req.user.id).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.post('/term/:termId/search', (req, res, next) => {
    models.Student.getCreditHoursByTerm(req.user.id, req.body.id, req.params.termId).then(total_hours => {
        let max_credit_hours = 38;
        if (!total_hours[0] || parseInt(total_hours[0].tch) + parseInt(req.body.ch) <= max_credit_hours) {
            models.CoursePrerequisite.getPreCoByStu(req.user.id, req.body.id).then(stuPres => {
                models.CoursePrerequisite.getPreCoByClass(req.body.id).then(totalPres => {
                    if (stuPres.length == totalPres.length) {
                        models.ClassMeeting.getScheduleByStu(req.user.id, req.params.termId).then(stuSchedules => {
                            models.ClassMeeting.getScheduleByCid(req.body.id).then(classSchedule => {
                                let canRegister = true;

                                if (stuSchedules[0]) {
                                    let i = 0;
                                    mainLoop:
                                        for (i; i < stuSchedules.length; i++) {
                                            let j = i;
                                            for (j; j < classSchedule.length; j++) {
                                                if ((stuSchedules[i].monday == 1 && classSchedule[j].monday == 1 &&
                                                        classSchedule[j].monday == stuSchedules[i].monday) ||
                                                    (stuSchedules[i].tuesday == 1 && classSchedule[j].tuesday == 1 &&
                                                        classSchedule[j].tuesday == stuSchedules[i].tuesday) ||
                                                    (stuSchedules[i].wednesday == 1 && classSchedule[j].wednesday == 1 &&
                                                        classSchedule[j].wednesday == stuSchedules[i].wednesday) ||
                                                    (stuSchedules[i].thursday == 1 && classSchedule[j].thursday == 1 &&
                                                        classSchedule[j].thursday == stuSchedules[i].thursday) ||
                                                    (stuSchedules[i].friday == 1 && classSchedule[j].friday == 1 &&
                                                        classSchedule[j].friday == stuSchedules[i].friday) ||
                                                    (stuSchedules[i].saturday == 1 && classSchedule[j].saturday == 1 &&
                                                        classSchedule[j].saturday == stuSchedules[i].saturday) ||
                                                    (stuSchedules[i].sunday == 1 && classSchedule[j].sunday == 1 &&
                                                        classSchedule[j].sunday == stuSchedules[i].sunday)) {
                                                    let time2 = timeSegments(classSchedule[j].time);
                                                    let time1 = timeSegments(stuSchedules[i].time);

                                                    console.log(time1)

                                                    if (((time2[0][0] == time1[0][0] && time2[0][1] >= time1[0][1]) && ((time2[0][0] < time1[1][0]) || ((time2[0][0] == time1[1][0]) && (time2[0][1] < time1[1][1])))
                                                        ) || ((time2[0][0] < time1[0][0]) && ((time2[1][0] > time1[0][0]) || (time2[1][0] == time1[0][0] && time2[1][1] > time1[0][1])))) {
                                                        canRegister = false
                                                        break mainLoop;
                                                    }

                                                }
                                            }
                                        }
                                }

                                if (canRegister) {
                                    models.ClassEnrollment.findOne({
                                        where: {
                                            student_id: req.user.id,
                                            class_id: req.body.id,
                                            status: "ongoing"
                                        }
                                    }).then(Class => {
                                        if (Class) {
                                            models.ClassEnrollment.update(
                                                {deleted: false},
                                                {where: {student_id: req.user.id, class_id: req.body.id}}
                                            ).then(result => {
                                                return res.status(200).send('Successfully Registered.');
                                            }).catch(err => {
                                                return res.status(501).send('Failed to Register.');
                                            });
                                        } else {
                                            models.ClassEnrollment.build({
                                                student_id: req.user.id,
                                                class_id: req.body.id,
                                            }).save().then(result => {
                                                return res.status(200).send('Successfully Registered.');
                                            }).catch(err => {
                                                return res.status(501).send('Failed to register.');
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(501).send("Time conflict error!");
                                }

                            });
                        });
                    } else {
                        if (!totalPres[0]) {
                            return res.status(501).send("Prerequisite Issue: ");
                        } else {
                            let i = 0;
                            let statusString = "Prerequisite Issue: ";
                            for (i; i < totalPres.length; i++) {
                                if (i == 0) {
                                    statusString += totalPres[i].title;
                                } else {
                                    statusString += ", " + totalPres[i].title;
                                }
                            }
                            return res.status(501).send(statusString);
                        }
                    }

                });
            });
        } else {
            return res.status(501).send("Not Enough Credit Hours: " + (max_credit_hours - parseInt(total_hours[0].tch)) + " Out of " + max_credit_hours);
        }
    });
});

router.delete('/term/:termId/search', (req, res, next) => {
    models.ClassEnrollment.update(
        {deleted: true},
        {where: {student_id: req.user.id, class_id: req.body.id}}
    ).then(result => {
        return res.status(200).send('Successfully Dropped.');
    }).catch(err => {
        return res.status(501).send('Failed to Drop.');
    });
});

function configureJson(classes) {
    let i = 0;
    for (i; i < classes.length; i++) {

        let schedule = "";

        if (classes[i].monday) {
            if (!schedule)
                schedule += "Monday";
            else
                schedule += ", Monday"
        }
        if (classes[i].tuesday) {
            if (!schedule)
                schedule += "Tuesday";
            else
                schedule += ", Tuesday"
        }
        if (classes[i].wednesday) {
            if (!schedule)
                schedule += "Wednesday";
            else
                schedule += ", Wednesday"
        }
        if (classes[i].thursday) {
            if (!schedule)
                schedule += "Thursday";
            else
                schedule += ", Thursday"
        }
        if (classes[i].friday) {
            if (!schedule)
                schedule += "Friday";
            else
                schedule += ", Friday"
        }
        if (classes[i].saturday) {
            if (!schedule)
                schedule += "Saturday";
            else
                schedule += ", Saturday"
        }
        if (classes[i].sunday) {
            if (!schedule)
                schedule += "Sunday";
            else
                schedule += ", Sunday"
        }

        if (classes[i].rem_enrollment === null)
            classes[i].rem_enrollment = classes[i].max_enrollment;
        classes[i].status = classes[i].rem_enrollment + " of " + classes[i].max_enrollment;
        classes[i].schedule = schedule;
        classes[i].title = classes[i].code + " " + classes[i].number + " - " + classes[i].name;
    }

    return classes;
}

function timeSegments(time) {
    var timeArray = time.split(" - ");
    let i = 0;
    for (i; i < timeArray.length; i++) {
        timeArray[i] = timeArray[i].split(":");
    }
    return timeArray;
}

module.exports = router;