const express = require('express');
const models = require('../../models');
const router = express.Router({mergeParams: true});

router.get('/', (req, res, next) => {
    models.Term.getStudentTerms(req.user.id).then(terms => {

        let termName = '';
        let isCorrect = false;

        let i = 0;
        for (i; i < terms.length; i++) {
            if (terms[i].id == req.params.term_id) {
                termName = terms[i].name;
                isCorrect = true;
                break;
            }
        }

        if (isCorrect) {
            models.Student.getFinalGradesList(req.user.id, req.params.term_id).then(finalGrades => {

                let sum_attempted_hours = 0;
                let sum_earned_hours = 0;
                let sum_gpa_hours = 0;
                let sum_quality_points = 0;

                let i = 0;
                for (i; i < finalGrades.length; i++) {

                    if (finalGrades[i].grade_letter != "N/A" || finalGrades[i].quality_points != "N/A") {
                        sum_attempted_hours += parseFloat(finalGrades[i].credit_hours);
                        sum_earned_hours += parseFloat(finalGrades[i].earned_hours);
                        sum_gpa_hours += parseFloat(finalGrades[i].gpa_hours);
                        sum_quality_points += parseFloat(finalGrades[i].quality_points);
                    } else {
                        sum_attempted_hours = null;
                        sum_earned_hours = null;
                        sum_gpa_hours = null;
                        sum_quality_points = null;

                        break;
                    }
                }

                let sum_gpa = (sum_quality_points == null || sum_gpa_hours == null) ? "N/A" : (sum_quality_points / sum_gpa_hours).toFixed(2);

                res.render("student/final-grades", {
                    title: "Final Grades - " + termName,
                    term_id_ajax: req.params.term_id,
                    current_attempted_hours: (sum_attempted_hours == null) ? "N/A" : sum_attempted_hours.toFixed(2),
                    current_earned_hours: (sum_earned_hours == null) ? "N/A" : sum_earned_hours.toFixed(2),
                    current_gpa_hours: (sum_gpa_hours == null) ? "N/A" : sum_gpa_hours.toFixed(2),
                    current_quality_points: (sum_quality_points == null) ? "N/A" : sum_quality_points.toFixed(2),
                    current_gpa: sum_gpa,
                    active: {
                        final_grades: true
                    },
                    imports: {
                        jquery: true,
                        jquery_ui: true,
                        uikit: true,
                        data_tables: true
                    }
                });

            }).catch(console.log);
        } else {
            let err = new Error('Not Found');
            err.status = 404;
            res.locals.error = err;
            res.status(err.status);
            return res.render('error', {layout: false});
        }

    }).catch(console.error);
});

router.get('/all', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Student.getFinalGradesList(req.user.id, req.params.term_id).then(finalGrades => {

        let i = 0;
        for (i; i < finalGrades.length; i++) {
            finalGrades[i].title = finalGrades[i].subject_code + " " + finalGrades[i].course_number + " - " + finalGrades[i].course_name;
        }

        json['data'] = finalGrades;
        res.status(200).json(json);
    }).catch(console.log);
});

module.exports = router;