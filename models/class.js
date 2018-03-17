module.exports = (sequelize, DataTypes) => {

	const Class = sequelize.define('Class', {
		id: {
			type: DataTypes.MEDIUMINT(8).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		course_id: {
			type: DataTypes.MEDIUMINT(8).UNSIGNED
		},
		instructor_id: {
			type: DataTypes.INTEGER(10).UNSIGNED
		},
		part_of_term_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		max_enrollment: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		},
		section: {
			type: DataTypes.STRING(191)
		},
		status: {
			type: DataTypes.ENUM('open', 'closed')
		}
	}, { tableName: 'class', });

	return Class;
};