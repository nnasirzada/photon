const express = require('express');
const models = require('../../models');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('student/unofficial-transcript', {
        title: 'Unofficial Transcript',
        active: {
            transcript: true
        },
        imports: {
            jquery: true,
            uikit: true
        }
    });
});


router.get('/all', (req, res, next) => {
    models.Student.getUnofficialTranscript(req.user.id).then(unofficialTranscript => {
        let json = {};
        json['data'] = [];

        json['data'] = unofficialTranscript;
        res.status(200).json(json);

    }).catch(console.log);
});

module.exports = router;