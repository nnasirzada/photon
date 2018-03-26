const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {

	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		firstname: {
			type: DataTypes.STRING(191)
		},
		lastname: {
			type: DataTypes.STRING(191)
		},
		patronymic: {
			type: DataTypes.STRING(191)
		},
		sex: {
			type: DataTypes.ENUM('male', 'female', 'other')
		},
		address: {
			type: DataTypes.TEXT('tiny')
		},
		email: {
			type: DataTypes.STRING(191)
		},
		password: {
			type: DataTypes.STRING(191)
		},
		date_of_birth: {
			type: DataTypes.DATEONLY
		},
		image_path: {
			type: DataTypes.STRING(191)
		},
		type: {
			type: DataTypes.ENUM('instructor', 'student', 'parent', 'admin')
		},
		status_login: {
			type: DataTypes.ENUM('active', 'deactive'),
			defaultValue: 'active'
		},
		deleted: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'user' });

	User.getTeachingTerms = user_id => {
		return sequelize.query("SELECT * FROM term WHERE id IN(SELECT term_id FROM part_of_term WHERE id IN (SELECT DISTINCT part_of_term_id FROM class WHERE instructor_id = ? AND deleted = 0) AND deleted = 0) AND deleted = 0 ORDER BY id DESC", {
			replacements: [user_id],
			type: sequelize.QueryTypes.SELECT
		});
	};

	User.getTeachingClasses = (user_id, term_id) => {
		return sequelize.query("SELECT a.*, b.name AS course_name, b.number AS course_number, c.code AS `subject_code` FROM(SELECT id AS `class_id`, course_id, section FROM class WHERE deleted = 0 AND instructor_id = ? AND part_of_term_id IN (SELECT id FROM part_of_term WHERE term_id = ? AND deleted = 0)) a LEFT JOIN course b ON a.course_id = b.id LEFT JOIN subject c ON b.subject_id = c.id", {
			replacements: [user_id, term_id],
			type: sequelize.QueryTypes.SELECT
		})
	};

	User.hook('beforeCreate', (user, options) => {
		user.password = bcrypt.hashSync(user.password, 5);
	});

	User.hook('beforeUpdate', (user, options) => {
		if (!user.password.startsWith('$2a$05$'))
			user.password = bcrypt.hashSync(user.password, 5);
	});

	return User;
};