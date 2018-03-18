const express = require('express');
const passport = require('passport');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    models.Student.getOpenTerms(req.user.id).then(terms => {
        res.render("student/registration", {
            title: "Select a term - Student Dashboard",
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

module.exports = router;