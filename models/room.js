module.exports = (sequelize, DataTypes) => {

	const Room = sequelize.define('Room', {
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
		building_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		}
	}, { tableName: 'room' });

	return Room;
};