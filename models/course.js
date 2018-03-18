module.exports = (sequelize, DataTypes) => {

	const Course = sequelize.define('Course', {
		id: {
			type: DataTypes.MEDIUMINT(8).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		number: {
			type: DataTypes.MEDIUMINT(8).UNSIGNED,
		},
		name: {
			type: DataTypes.STRING(191)
		},
		description: {
			type: DataTypes.TEXT()
		},
		credit_hours: {
			type: DataTypes.DECIMAL(4, 2)
		},
		gpa_hours: {
			type: DataTypes.DECIMAL(4, 2)
		},
		passing_grade_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		schedule_type_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		grade_mode_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		subject_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		school_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		}
	}, { tableName: 'course' });

	return Course;
};