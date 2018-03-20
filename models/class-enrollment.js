module.exports = (sequelize, DataTypes) => {

	const ClassEnrollment = sequelize.define('ClassEnrollment', {
		id: {
			type: DataTypes.BIGINT(20).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		student_id: {
			type: DataTypes.INTEGER(10).UNSIGNED
		},
		class_id: {
			type: DataTypes.MEDIUMINT(8).UNSIGNED
		},
		grade_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		grade_percents: {
			type: DataTypes.DECIMAL(5, 2)
		},
		status: {
			type: DataTypes.ENUM('ongoing', 'dropped', 'withdrawn', 'passed', 'failed')
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'class_enrollment' });

	return ClassEnrollment;
};