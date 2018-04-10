module.exports = (sequelize, DataTypes) => {

    const Course = sequelize.define('Course', {
        id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        number: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED,
        },
        name: {
            type: DataTypes.STRING(191)
        },
        description: {
            type: DataTypes.TEXT()
        },
        credit_hours: {
            type: DataTypes.DECIMAL(4, 2)
        },
        gpa_hours: {
            type: DataTypes.DECIMAL(4, 2)
        },
        passing_grade_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        schedule_type_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        grade_mode_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        program_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        subject_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        school_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        deleted: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        }
    }, {tableName: 'course'});

    Course.getCourseDetailsByClassId = class_id => {
        return sequelize.query('select su.code as code, co.number as number, co.name as name, cl.section as section from class cl join course co on cl.deleted = false and cl.id = ? and co.deleted = false and cl.course_id = co.id join subject su on su.deleted = false and co.subject_id = su.id', {
            replacements: [class_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Course;
};