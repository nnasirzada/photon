const Term = require('./term');

module.exports = (sequelize, DataTypes) => {

	const Instructor = sequelize.define('Instructor', {
		user_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true
		},
		status: {
			type: DataTypes.ENUM('active', 'deactive')
		}
	}, { tableName: 'instructor' });

	Instructor.getTeachingTerms = user_id => {
		return sequelize.query('SELECT * FROM term WHERE id IN (SELECT term_id FROM part_of_term WHERE id IN (SELECT DISTINCT part_of_term_id FROM class WHERE instructor_id = ?)) ORDER BY id DESC', {
			replacements: [user_id],
			type: sequelize.QueryTypes.SELECT
		});
	};

	Instructor.getTeachingClasses = (user_id, term_id) => {
		return sequelize.query('SELECT a.*, b.name AS course_name, b.number AS course_number, c.code AS `subject_code` FROM (SELECT id AS `class_id`, course_id, section FROM class WHERE instructor_id = ? AND part_of_term_id IN (SELECT id FROM part_of_term WHERE term_id = ?)) a LEFT JOIN course b ON a.course_id = b.id LEFT JOIN subject c ON b.subject_id = c.id', {
			replacements: [user_id, term_id],
			type: sequelize.QueryTypes.SELECT
		})
	}

	return Instructor;
};