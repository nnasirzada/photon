module.exports = (sequelize, DataTypes) => {

	const PartOfTerm = sequelize.define('PartOfTerm', {
		id: {
			type: DataTypes.SMALLINT(5).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
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
		term_id: {
			type: DataTypes.SMALLINT(5).UNSIGNED
		}
	}, { tableName: 'part_of_term' });

	return PartOfTerm;
};