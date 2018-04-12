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

    CoursePrerequisite.getPreCoByStu = (student_id, class_id) => {
        return sequelize.query('select concat(s.code, " ", co.number, " - ", co.name) as title from (select class_id from class_enrollment where student_id = ? and deleted = false and (status = "passed" or status = "ongoing") and class_id in (select id from class where deleted = false and course_id in (select prerequisite_id from course_prerequisite where deleted = false and course_id in (select course_id from class where deleted = false and id in (select class_id from class_enrollment where class_id = ? and student_id = ? and status = "ongoing"))))) w join class c on w.class_id = c.id and c.deleted = false join course co on c.course_id = co.id and co.deleted = false join subject s on co.subject_id = s.id and s.deleted = false', {
            replacements: [student_id, class_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    CoursePrerequisite.getPreCoByClass = (class_id) => {
        return sequelize.query('select concat(s.code, " ", co.number, " - ", co.name) as title from (select prerequisite_id from course_prerequisite where deleted = false and course_id in (select course_id from class where id = ? and deleted = false)) w join course co on w.prerequisite_id = co.id and co.deleted = false join subject s on co.subject_id = s.id and s.deleted = false', {
            replacements: [class_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return CoursePrerequisite;
};