const Joi = require('joi');

module.exports = {
	validate: (schema) => {
		return (req, res, next) => {
			let result = Joi.validate(req.body, schema);
			if (result.error) {
				return res.status(400).json(result.error);
			}
			if (!req.value) req.value = {};
			req.value['body'] = result.value;
			next();
		}
	},

	schemas: {
		createUser: Joi.object().keys({
			firstname: Joi.string().required(),
			lastname: Joi.string().required(),
			patronymic: Joi.string().required(),
			date_of_birth: Joi.date().required(),
			gender: Joi.string().regex(/male|female|other/).required(),
			address: Joi.string().required(),
			type: Joi.string().regex(/instructor|student|parent|admin/).required(),
			email: Joi.string().email().required(),
			password: Joi.string().required()
		})
	}
}