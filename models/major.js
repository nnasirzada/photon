module.exports = (sequelize, DataTypes) => {

	const Major = sequelize.define('Major', {
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
		school_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		program_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		}
	}, { tableName: 'major', });

	return Major;
};