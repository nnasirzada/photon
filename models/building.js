module.exports = (sequelize, DataTypes) => {

	const Building = sequelize.define('Building', {
		id: {
			type: DataTypes.SMALLINT(5).UNSIGNED,
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
	}, { tableName: 'building' });

	return Building;
};