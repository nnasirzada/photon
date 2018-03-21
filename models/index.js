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

db.User.hasMany(db.Class, { foreignKey: 'id' });
db.Course.hasMany(db.Class, { foreignKey: 'id' });
db.School.hasMany(db.Major, { foreignKey: 'id' });
db.Program.hasMany(db.Major, { foreignKey: 'id' })
db.School.hasMany(db.Course, { foreignKey: 'id' });
db.Program.hasMany(db.Course, { foreignKey: 'id' });
db.Term.hasMany(db.PartOfTerm, { foreignKey: 'id' });
db.PartOfTerm.hasMany(db.Class, { foreignKey: 'id' });
db.GradeMode.hasMany(db.Course, { foreignKey: 'id' });
db.GradeScale.hasMany(db.Course, { foreignKey: 'id' });
db.ScheduleType.hasMany(db.Course, { foreignKey: 'id' });
db.Course.hasMany(db.CoursePrerequisite, { foreignKey: 'id' });
db.Class.belongsTo(db.Course, { foreignKey: 'course_id' });
db.Major.belongsTo(db.School, { foreignKey: 'school_id' });
db.PartOfTerm.belongsTo(db.Term, { foreignKey: 'term_id' });
db.Major.belongsTo(db.Program, { foreignKey: 'program_id' });
db.Course.belongsTo(db.School, { foreignKey: 'school_id' });
db.Class.belongsTo(db.User, { foreignKey: 'instructor_id' });
db.Course.belongsTo(db.Program, { foreignKey: 'program_id' });
db.Course.belongsTo(db.Subject, { foreignKey: 'subject_id' });
db.Course.belongsTo(db.GradeMode, { foreignKey: 'grade_mode_id' });
db.Class.belongsTo(db.PartOfTerm, { foreignKey: 'part_of_term_id' });
db.Course.belongsTo(db.GradeScale, { foreignKey: 'passing_grade_id' });
db.Course.belongsTo(db.ScheduleType, { foreignKey: 'schedule_type_id' });
db.CoursePrerequisite.belongsTo(db.Course, { foreignKey: 'course_id' });
db.CoursePrerequisite.belongsTo(db.Course, { foreignKey: 'prerequisite_id' });

module.exports = db;