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
			type: DataTypes.STRING(191)
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
		}
	}, { tableName: 'person', });

	User.hook('beforeUpdate', (user, options) => {
		user.password = bcrypt.hashSync(user.password, 5);
	});

	return User;
};