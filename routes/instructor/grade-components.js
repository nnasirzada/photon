const express = require('express');
const models = require('../../models');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
	res.render('instructor/classes/grade-components', {
		title: 'Grade Components',
		active: {
			classes: true
		},
		imports: {
			jquery: true,
			jquery_ui: true,
			uikit: true,
			data_tables: true
		}
	});
});

// Get all grade components by class id
router.get('/all', (req, res, next) => {
	models.sequelize.query("SELECT gc.id, gc.name, gc.weight FROM grade_component gc INNER JOIN class c ON gc.class_id = c.id AND c.instructor_id = ? WHERE gc.deleted = 0 AND gc.class_id = ?", {
		replacements: [req.user.id, req.params.classId],
		type: models.sequelize.QueryTypes.SELECT
	}).then(values => {
		let json = {};
		json['data'] = values;
		res.status(200).json(json);
	}).catch(err => {
		res.locals.error = err;
		res.status(err.status || 500);
		return res.render('error', { layout: false });
	});
});

// Create a new grade component
router.post('/', (req, res, next) => {
	req.checkBody('name', null).notEmpty();
	req.checkBody('weight', null).notEmpty().isNumeric();
	req.checkParams('classId', null).notEmpty().isNumeric();

	let errors = req.validationErrors();
	if (errors) return res.status(501).send(errors[0].msg);

	return models.PartOfTerm.isOpenToEdits(req.params.classId, req.user.id).then(result => {
		if (result[0] && result[0].open_to_edits) {
			let replacements = [
				req.body.name,
				req.body.weight,
				req.params.classId,
				req.params.classId,
				req.user.id
			];

			return models.sequelize.query("INSERT INTO `grade_component`(`name`, `weight`, `class_id`) VALUES (?, ?, ?)", {
				replacements: replacements,
				model: models.GradeComponent,
				type: models.sequelize.QueryTypes.INSERT
			});
		} else {
			throw new Error('Term is not open for edits.')
		}
	}).then((result) => {
		if (!result) throw new Error('Failed to save grade component');
		return models.GradeComponent.findOne({
			where: {
				id: result[0][0].id,
				deleted: false
			}
		});
	}).then(GradeComponent => {
		return res.status(200).json(GradeComponent);
	}).catch(err => {
		return res.status(501).send(err.message);
	});
});

// Update grade component
router.put('/:id', (req, res, next) => {

	req.checkBody('name', null).notEmpty();
	req.checkBody('weight', null).notEmpty().isDecimal();
	req.checkParams('id', null).notEmpty().isNumeric();
	req.checkParams('classId', null).notEmpty().isNumeric();

	let errors = req.validationErrors();
	if (errors) return res.status(501).send(errors[0].msg);

	return models.PartOfTerm.isOpenToEdits(req.params.classId, req.user.id).then(result => {
		if (result[0] && result[0].open_to_edits) {
			return models.GradeComponent.update(
				{
					name: req.body.name,
					weight: req.body.weight
				},
				{
					where: {
						id: req.body.id,
						class_id: req.params.classId
					}
				}
			);
		} else {
			throw new Error('Term is not open for edits.')
		}
	}).then((result) => {
		return models.GradeComponent.findOne({ where: { id: req.params.id } });
	}).then(GradeComponent => {
		if (!GradeComponent)
			throw new Error('Grade componont not found');
		return res.status(200).json(GradeComponent);
	}).catch(err => {
		return res.status(501).send(err.message);
	});
});

// Delete grade component
router.delete('/:id', (req, res, next) => {
	return models.PartOfTerm.isOpenToEdits(req.params.classId, req.user.id).then(result => {
		if (result[0] && result[0].open_to_edits) {
			return models.GradeComponent.update(
				{ deleted: true },
				{ where: { id: req.body.id, class_id: req.params.classId } }
			);
		} else {
			throw new Error('Term is not open for edits.')
		}
	}).then((result) => {
		return res.status(200).json('Grade component deleted successfully.');
	}).catch(err => {
		return res.status(501).send(err.message);
	})
});

module.exports = router;