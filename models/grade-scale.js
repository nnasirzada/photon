module.exports = (sequelize, DataTypes) => {

	const GradeScale = sequelize.define('GradeScale', {
		id: {
			type: DataTypes.SMALLINT(5).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		grade_letter: {
			type: DataTypes.STRING(191)
		},
		grade_point: {
			type: DataTypes.DECIMAL(4, 2)
		},
		min_percents: {
			type: DataTypes.DECIMAL(5, 2)
		},
	}, { tableName: 'grade_scale' });

	return GradeScale;
};