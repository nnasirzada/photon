const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {

	const Building = sequelize.define('Building', {
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
	}, { tableName: 'building', });

	return Building;
};