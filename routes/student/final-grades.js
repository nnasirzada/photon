const express = require('express');
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = null;
        let termFound = false;

        let i = 0;
        for (i; i < terms.length; i++) {
            if (terms[i].id == req.params.term_id) {
                termName = terms[i].name;
                termFound = true;
                break;
            }
        }

        if (termFound) {
            models.Student.getFinalGrades(req.user.id, req.params.term_id).then(grades => {

                let quality_points = 0;
                let attempted_hours = 0;
                let earned_hours = 0;
                let gpa_hours = 0;

                let i = 0;
                for (i; i < grades.length; i++) {
                    if (grades[i].grade_letter != "N/A" || grades[i].quality_points != "N/A") {
                        quality_points += parseFloat(grades[i].quality_points);
                        attempted_hours += parseFloat(grades[i].credit_hours);
                        earned_hours += parseFloat(grades[i].earned_hours);
                        gpa_hours += parseFloat(grades[i].gpa_hours);
                    } else {
                        quality_points = null;
                        attempted_hours = null;
                        earned_hours = null;
                        gpa_hours = null;
                        break;
                    }
                }

                let gpa = (quality_points == null || gpa_hours == null) ? "N/A" : (quality_points / gpa_hours).toFixed(2);

                res.render("student/final-grades", {
                    title: "Final Grades - " + termName,
                    term_id: req.params.term_id,
                    quality_points: (quality_points == null) ? "N/A" : quality_points.toFixed(2),
                    attempted_hours: (attempted_hours == null) ? "N/A" : attempted_hours.toFixed(2),
                    earned_hours: (earned_hours == null) ? "N/A" : earned_hours.toFixed(2),
                    gpa_hours: (gpa_hours == null) ? "N/A" : gpa_hours.toFixed(2),
                    gpa: gpa,
                    active: {
                        terms: true
                    },
                    imports: {
                        uikit: true,
                        jquery: true,
                        jquery_ui: true,
                        data_tables: true
                    }
                });
            }).catch(console.log);
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
    models.Student.getFinalGrades(req.user.id, req.params.term_id).then(grades => {
        let i = 0;
        for (i; i < grades.length; i++)
            grades[i].title = grades[i].subject_code
                + " " + grades[i].course_number
                + " - " + grades[i].course_name;
        json['data'] = grades;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;