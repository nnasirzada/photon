module.exports = (sequelize, DataTypes) => {

	const GradeMode = sequelize.define('GradeMode', {
		id: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		code: {
			type: DataTypes.STRING(191)
		},
		name: {
			type: DataTypes.STRING(191)
		}
	}, { tableName: 'grade_mode', });

	return GradeMode;
};