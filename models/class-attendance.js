module.exports = (sequelize, DataTypes) => {

    const ClassAttendance = sequelize.define('ClassAttendance', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.DATE
        },
        class_id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED
        },
        student_id: {
            type: DataTypes.INTEGER(10).UNSIGNED
        },
        status: {
            type: DataTypes.ENUM('present', 'absent', 'excused')
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {tableName: 'class_attendance'});

    return ClassAttendance;
};