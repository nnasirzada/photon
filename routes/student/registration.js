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
                title: "Register for Classes",
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

module.exports = router;