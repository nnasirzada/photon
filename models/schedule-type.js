module.exports = (sequelize, DataTypes) => {

	const ScheduleType = sequelize.define('ScheduleType', {
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
	}, { tableName: 'schedule_type' });

	return ScheduleType;
};