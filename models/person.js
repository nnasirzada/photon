module.exports = (sequelize, DataTypes) => {
	const Person = sequelize.define('Person', {
		id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
			primaryKey: true,
			autoIncrement: true
		},
		firstname: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		lastname: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		patronymic: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		sex: {
			type: DataTypes.ENUM('male', 'female', 'other'),
			allowNull: false
		},
		address: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		email: {
			type: DataTypes.STRING(191),
			allowNull: false,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING(191),
			allowNull: false
		},
		date_of_birth: {
			type: DataTypes.DATEONLY,
			allowNull: false
		},
		image_path: {
			type: DataTypes.STRING(191)
		},
		type: {
			type: DataTypes.ENUM('instructor', 'student', 'parent', 'admin'),
			allowNull: false
		}
	}, {
			tableName: 'person'
		}
	);

	return Person;
};