module.exports = (sequelize, DataTypes) => {

	const ResetPasswordToken = sequelize.define('ResetPasswordToken', {
		person_id: {
			type: DataTypes.INTEGER(10).UNSIGNED,
		},
		token: {
			type: DataTypes.STRING(191),
			primaryKey: true
		},
		expires_at: {
			type: DataTypes.TIME(),
			defaultValue: new Date(Date.now() + 24 * 60 * 60 * 1000)
		},
		used: {
			type: DataTypes.BOOLEAN(),
			defaultValue: false
		}
	}, { tableName: 'reset_password_token' });

	return ResetPasswordToken;
};