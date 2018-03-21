module.exports = (sequelize, DataTypes) => {

	const GradeComponent = sequelize.define('GradeComponent', {
		id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING(191)
		},
		weight: {
			type: DataTypes.DECIMAL(5, 2)
		},
		class_id: {
			type: DataTypes.MEDIUMINT(8)
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'grade_component' });

	return GradeComponent;
};