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

	PartOfTerm.isOpenToEdits = (classId, instructor_id) => {
		return sequelize.query("SELECT pot.open_to_edits FROM part_of_term pot INNER JOIN class c ON pot.id = c.part_of_term_id WHERE c.id = ? AND c.instructor_id = ? AND c.deleted = 0 AND pot.deleted = 0 LIMIT 1", {
			replacements: [classId, instructor_id],
			type: sequelize.QueryTypes.SELECT
		});
	}

	return PartOfTerm;
};