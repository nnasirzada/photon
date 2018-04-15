const express = require('express');
const models = require('../../models');
const router = express.Router();
const moment = require('moment');
const RRule = require('rrule').RRule;

router.get('/', (req, res, next) => {
    res.render('student/schedule', {
        title: 'Schedule',
        active: {
            schedule: true
        },
        imports: {
            uikit: true,
            moment: true,
            jquery: true,
            full_calendar: true
        }
    });
});

router.get('/events', (req, res, next) => {

    if (req.query.start && req.query.end
        && moment(req.query.start, 'YYYY-M-DD', true).isValid()
        && moment(req.query.end, 'YYYY-M-DD', true).isValid()) {

        models.sequelize.query("SELECT DISTINCT te.id as term_id, cm.*, c.name AS `course_name` FROM (SELECT id, course_id, part_of_term_id FROM class WHERE deleted = 0 AND id in (SELECT class_id FROM `class_enrollment` WHERE deleted = 0 AND student_id = ?) AND part_of_term_id IN (SELECT id FROM part_of_term WHERE deleted = 0 AND term_id = (SELECT id FROM term WHERE (? BETWEEN start_date AND end_date) AND deleted = 0 ORDER BY start_date DESC LIMIT 1))) a INNER JOIN class_meeting cm ON a.id = cm.class_id INNER JOIN course c ON c.deleted = 0 and a.course_id = c.id INNER JOIN part_of_term pt on pt.deleted = 0 and a.part_of_term_id = pt.id INNER JOIN term te on te.deleted = 0 and pt.term_id = te.id WHERE cm.deleted = 0", {
            replacements: [req.user.id, req.query.start],
            type: models.sequelize.QueryTypes.SELECT
        }).then(values => {

            let colors = [
                { code: '#F5D76A' },
                { code: '#6699CC' },
                { code: '#E78B6C' },
                { code: '#5FB3B3' },
                { code: '#C594C5' },
                { code: '#82B440' },
                { code: '#279A54' }
            ];
            let usedColors = {};
            let events = [];

            for (let i = 0; i < values.length; i++) {

                let byweekday = [];
                let eventColor;

                if (usedColors[values[i].class_id]) {
                    eventColor = usedColors[values[i].class_id];
                } else {
                    eventColor = colors.shift().code;
                    usedColors[values[i].class_id] = eventColor;
                }

                if (values[i].monday) byweekday.push(RRule.MO);
                if (values[i].tuesday) byweekday.push(RRule.TU);
                if (values[i].wednesday) byweekday.push(RRule.WE);
                if (values[i].thursday) byweekday.push(RRule.TH);
                if (values[i].friday) byweekday.push(RRule.FR);
                if (values[i].saturday) byweekday.push(RRule.SA);
                if (values[i].sunday) byweekday.push(RRule.SU);

                let rule = new RRule({
                    freq: RRule.WEEKLY,
                    byweekday: byweekday,
                    dtstart: new Date(req.query.start),
                    until: new Date(req.query.end)
                });

                rule.all((date, index) => {
                    return events.push({
                        id: values[i].class_id,
                        title: values[i].course_name,
                        start: new Date(date.getTime() + getSeconds(values[index].start_time) * 1000),
                        end: new Date(date.getTime() + getSeconds(values[index].end_time) * 1000),
                        overlap: true,
                        url: '/student/terms/' + values[i].term_id + '/classes/' + values[i].class_id + '/',
                        color: eventColor
                    });
                });
            }
            res.status(200).json(events);
        }).catch(console.error);
    } else {
        throw new Error('Something went wrong.');
    }
});

function getSeconds(timeString) {
    var arr = timeString.split(':');
    return (+arr[0]) * 60 * 60 + (+arr[1]) * 60 + (+arr[2]);
}

module.exports = router;