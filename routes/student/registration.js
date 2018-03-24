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
    models.Term.getRegClassesByTerm(req.params.termId).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/co/:courseNum', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeSuCo(req.params.termId, req.params.subjectId, req.params.courseNum).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeSu(req.params.termId, req.params.subjectId).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/co/:courseNum', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeCo(req.params.termId, req.params.courseNum).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeKe(req.params.termId, req.params.keyword).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeSuKe(req.params.termId, req.params.subjectId, req.params.keyword).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/co/:courseNum/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByTeCoKe(req.params.termId, req.params.courseNum, req.params.keyword).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
});

router.get('/term/:termId/su/:subjectId/co/:courseNum/ke/:keyword', (req, res, next) => {
    let json = {};
    json['data'] = [];
    models.Term.getRegClassesByAll(req.params.termId, req.params.subjectId, req.params.courseNum, req.params.keyword).then(classes => {
        json['data'] = configureJson(classes);
        res.status(200).json(json);
    }).catch(console.log);
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

        classes[i].status = classes[i].rem_enrollment + " of " + classes[i].max_enrollment;
        classes[i].schedule = schedule;
        classes[i].title = classes[i].code + " " + classes[i].number + " - " + classes[i].name;
    }

    return classes;
}

module.exports = router;