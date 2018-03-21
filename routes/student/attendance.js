const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {
        res.render('student/attendance', {
            title: 'Select a Term',
            active: {
                attendance: true
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
            res.render("student/attendance/attendance-by-term", {
                title: "Attendance in " + termName,
                term_id_ajax: req.params.termId,
                active: {
                    attendance: true
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

router.get('/term/:termId/all', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getAttendanceByTerm(req.user.id, req.params.termId).then(attendances => {

        let i = 0;
        for (i; i < attendances.length; i++) {
            let schedule = "";

            if (attendances[i].monday) {
                if (!schedule)
                    schedule += "Monday";
                else
                    schedule += ", Monday"
            }
            if (attendances[i].tuesday) {
                if (!schedule)
                    schedule += "Tuesday";
                else
                    schedule += ", Tuesday"
            }
            if (attendances[i].wednesday) {
                if (!schedule)
                    schedule += "Wednesday";
                else
                    schedule += ", Wednesday"
            }
            if (attendances[i].thursday) {
                if (!schedule)
                    schedule += "Thursday";
                else
                    schedule += ", Thursday"
            }
            if (attendances[i].friday) {
                if (!schedule)
                    schedule += "Friday";
                else
                    schedule += ", Friday"
            }
            if (attendances[i].saturday) {
                if (!schedule)
                    schedule += "Saturday";
                else
                    schedule += ", Saturday"
            }
            if (attendances[i].sunday) {
                if (!schedule)
                    schedule += "Sunday";
                else
                    schedule += ", Sunday"
            }

            attendances[i].percentage = ((attendances[i].total_classes - attendances[i].missed) * 100 / attendances[i].total_classes) + "%";
            attendances[i].schedule = schedule;
        }

        json['data'] = attendances;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;