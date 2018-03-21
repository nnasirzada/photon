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
		},
		open_to_edits: {
			type: DataTypes.BOOLEAN()
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'part_of_term' });

	return PartOfTerm;
};