const express = require('express');
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
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
            res.render("student/attendance", {
                title: "Attendance - " + termName,
                term_id: req.params.term_id,
                active: {
                    attendance: true
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
    }).catch(err => {
        res.locals.error = err;
        res.status(err.status || 500);
        return res.render('error', { layout: false });
    });
});

router.get('/all', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getAttendance(req.user.id, req.params.term_id).then(attendances => {

        let i = 0;
        for (i; i < attendances.length; i++) {

            let schedule = [];
            if (attendances[i].monday) schedule.push("Mon");
            if (attendances[i].tuesday) schedule.push("Tue");
            if (attendances[i].wednesday) schedule.push("Wed");
            if (attendances[i].thursday) schedule.push("Thu");
            if (attendances[i].friday) schedule.push("Fri");
            if (attendances[i].saturday) schedule.push("Sat");
            if (attendances[i].sunday) schedule.push("Sun");

            attendances[i].percentage = ((attendances[i].total_classes - attendances[i].missed) * 100 / attendances[i].total_classes).toFixed(2) + "%";
            attendances[i].schedule = schedule.join(', ');;
            attendances[i].time = attendances[i].start_time + " - " + attendances[i].end_time;
            attendances[i].title = attendances[i].subject + " " + attendances[i].crn + " - " + attendances[i].name;
        }

        json['data'] = attendances;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;