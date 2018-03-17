module.exports = (sequelize, DataTypes) => {

	const Instructor = sequelize.define('Instructor', {
		user_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true
		},
		status: {
			type: DataTypes.ENUM('active', 'deactive')
		}
	}, { tableName: 'instructor', });

	return Instructor;
};