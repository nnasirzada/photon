module.exports = (sequelize, DataTypes) => {

	const Program = sequelize.define('Program', {
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
		}
	}, { tableName: 'program' });

	return Program;
};