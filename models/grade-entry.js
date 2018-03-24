module.exports = (sequelize, DataTypes) => {

	const GradeEntry = sequelize.define('GradeEntry', {
		id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		student_id: {
			type: DataTypes.INTEGER(10)
		},
		component_id: {
			type: DataTypes.INTEGER(10)
		},
		percentage: {
			type: DataTypes.DECIMAL(5, 2)
		},
		submitted_at: {
			type: DataTypes.DATE
		},
		updated_at: {
			type: DataTypes.DATE
		}
	}, { tableName: 'grade_entry' });

	return GradeEntry;
};