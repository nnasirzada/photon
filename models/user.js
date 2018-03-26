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

	User.hook('beforeCreate', (user, options) => {
		user.password = bcrypt.hashSync(user.password, 5);
	});

	User.hook('beforeUpdate', (user, options) => {
		if (!user.password.startsWith('$2a$05$'))
			user.password = bcrypt.hashSync(user.password, 5);
	});

	return User;
};