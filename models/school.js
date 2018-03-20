module.exports = (sequelize, DataTypes) => {

	const School = sequelize.define('School', {
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
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'school' });

	return School;
};