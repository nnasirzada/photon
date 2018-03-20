module.exports = (sequelize, DataTypes) => {

	const Term = sequelize.define('Term', {
		id: {
			type: DataTypes.INTEGER(5).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		year: {
			// Actual type is YEAR in MySQL
			type: DataTypes.SMALLINT(4)
		},
		season: {
			type: DataTypes.ENUM('spring', 'summer', 'fall', 'other')
		},
		name: {
			type: DataTypes.STRING(191)
		},
		start_date: {
			type: DataTypes.DATEONLY()
		},
		end_date: {
			type: DataTypes.DATEONLY()
		},
		status: {
			type: DataTypes.ENUM('view_only', 'open', 'hidden')
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'term' });

	return Term;
};