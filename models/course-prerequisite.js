module.exports = (sequelize, DataTypes) => {

    const CoursePrerequisite = sequelize.define('CoursePrerequisite', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        course_id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED,
        },
        prerequisite_id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED,
        },
        deleted: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        }
    }, { tableName: 'course_prerequisite' });

    return CoursePrerequisite;
};