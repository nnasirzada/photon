const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {

    models.Student.getProfileData(req.user.id).then(Student => {
        models.Student.getRegisteredTerms(req.user.id).then(Terms => {

            var obj = {};
            obj['data'] = [];

            models.Student.getUnofficialTranscriptData(req.user.id).then(TranscriptData => {

                obj['data'] = TranscriptData;
                var groupedByTerm = groupBy(TranscriptData, 'term_id')

                var cumul_attempt_hours = 0;
                var cumul_earned_hours = 0;
                var cumul_gpa_hours = 0;
                var cumul_quality_points = 0;
                var cumul_gpa = 0;

                for (let i = 0; i < Terms.length; i++) {
                    // console.log(Terms[i].id);
                    // console.log(groupedByTerm[Terms[i].id][1]['code']); [name][index][name]

                    var curr_attempt_hours = 0;
                    var curr_earned_hours = 0;
                    var curr_gpa_hours = 0;
                    var curr_quality_points = 0;
                    var curr_gpa = 0;

                    // iterate over courses per Terms[i] (e.g spring 2018) and calc current data
                    for (let j = 0; j < Object.keys(groupedByTerm[Terms[i].id]).length; j++) {
                        var course = groupedByTerm[Terms[i].id][j]; //get current course

                        var attempt_hours = parseFloat(course['credit_hours']);
                        curr_attempt_hours = curr_attempt_hours + attempt_hours;

                        // skip ongoing term as their grades are not ready yet
                        if (course['grade_letter']) {// 'status'!= 'ongoing') {

                            var earned_hours = (course['status'] == 'passed') ? parseFloat(course['credit_hours']) : 0;
                            curr_earned_hours = curr_earned_hours + earned_hours;

                            var gpa_hours = (course['status'] == 'passed') ? parseFloat(course['gpa_hours']) : 0;
                            curr_gpa_hours = curr_gpa_hours + gpa_hours;

                            var quality_points = parseFloat(course['quality_points']);
                            curr_quality_points = curr_quality_points + quality_points;

                            var curr_gpa = (curr_attempt_hours == 0) ? 0 : curr_quality_points / curr_attempt_hours;

                        }

                    }

                    // calc cumulative data if not current data
                    cumul_attempt_hours = cumul_attempt_hours + curr_attempt_hours;
                    cumul_earned_hours = cumul_earned_hours + curr_earned_hours;
                    cumul_gpa_hours = cumul_gpa_hours + curr_gpa_hours;
                    cumul_quality_points = cumul_quality_points + curr_quality_points;
                    cumul_gpa = (cumul_attempt_hours == 0) ? 0 : cumul_quality_points / cumul_attempt_hours;

                    // push collected data to each course
                    for (let j = 0; j < Object.keys(groupedByTerm[Terms[i].id]).length; j++) {
                        groupedByTerm[Terms[i].id][j]['curr_attempt_hours'] = (curr_attempt_hours == 0) ? null : curr_attempt_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['curr_earned_hours'] = (curr_earned_hours == 0) ? null : curr_earned_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['curr_gpa_hours'] = (curr_gpa_hours == 0) ? null : curr_gpa_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['curr_quality_points'] = (curr_quality_points == 0) ? null : curr_quality_points.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['curr_gpa'] = (curr_gpa == 0) ? null : curr_gpa.toFixed(2);

                        groupedByTerm[Terms[i].id][j]['cumul_attempt_hours'] = (cumul_attempt_hours == 0) ? null : cumul_attempt_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['cumul_earned_hours'] = (cumul_earned_hours == 0) ? null : cumul_earned_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['cumul_gpa_hours'] = (curr_gpa_hours == 0) ? null : curr_gpa_hours.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['cumul_quality_points'] = (cumul_quality_points == 0) ? null : cumul_quality_points.toFixed(2);
                        groupedByTerm[Terms[i].id][j]['cumul_gpa'] = (cumul_gpa == 0) ? null : cumul_gpa.toFixed(2);
                    }



                }

                console.log(Student[0]);

                res.render('student/unofficial-transcript', {
                    title: 'Unofficial Transcript',
                    active: {
                        transcript: true
                    },
                    imports: {
                        jquery: true,
                        jquery_ui: true,
                        uikit: true,
                        data_tables: true
                    },
                    student: Student[0],
                    groupedByTerm: groupedByTerm,
                    error: req.flash('error'),
                    success: req.flash('success')
                });
            })


        })

    })
});


var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

module.exports = router;