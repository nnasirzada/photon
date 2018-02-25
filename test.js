const models = require('./models');
const Op = models.Sequelize.Op;

models.Person.findAll({ where: { id: 2 } }).then((result) => {
	console.log(result[0].email);
});