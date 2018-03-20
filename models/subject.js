module.exports = (sequelize, DataTypes) => {

	const Subject = sequelize.define('Subject', {
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
	}, { tableName: 'subject' });

	return Subject;
};