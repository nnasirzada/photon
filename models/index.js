require('dotenv').config();
const Sequelize = require('sequelize');
const path = require('path');
const basename = path.basename(module.filename);
const fs = require('fs');
const db = {};

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
	dialect: 'mysql',
	host: process.env.DB_HOST,
	pool: {
		max: 10,
		min: 1
	},
	define: {
		freezeTableName: true,
		timestamps: false
	}
});

fs
	.readdirSync(__dirname)
	.filter(function (file) {
		return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
	})
	.forEach(function (file) {
		const model = sequelize['import'](path.join(__dirname, file));
		db[model.name] = model;
	});

Object.keys(db).forEach(function (modelName) {
	if (db[modelName].associate) {
		db[modelName].associate(db);
	}
});

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.School.hasMany(db.Major, { foreignKey: 'id' });
db.Program.hasMany(db.Major, { foreignKey: 'id' });
db.Major.belongsTo(db.School, { foreignKey: 'school_id' });
db.Major.belongsTo(db.Program, { foreignKey: 'program_id' });

module.exports = db;