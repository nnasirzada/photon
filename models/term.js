module.exports = (sequelize, DataTypes) => {

    const Term = sequelize.define('Term', {
        id: {
            type: DataTypes.INTEGER(5).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        year: {
            // Actual type is YEAR in MySQL
            type: DataTypes.SMALLINT(4)
        },
        season: {
            type: DataTypes.ENUM('spring', 'summer', 'fall', 'other')
        },
        name: {
            type: DataTypes.STRING(191)
        },
        start_date: {
            type: DataTypes.DATEONLY()
        },
        end_date: {
            type: DataTypes.DATEONLY()
        },
        status: {
            type: DataTypes.ENUM('view_only', 'open', 'hidden')
        },
        deleted: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        }
    }, {tableName: 'term'});

    Term.getStudentTerms = student_id => {
        return sequelize.query('Select * from term where deleted = false and id in (select term_id from part_of_term where deleted = false and id in (select part_of_term_id from class where deleted = false and id in (select class_id from class_enrollment where deleted = false and student_id = ?))) order by id desc', {
            replacements: [student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTerm = (term_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeSuCo = (term_id, subject_id, course_number) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.number = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [subject_id, course_number, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeSu = (term_id, subject_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [subject_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeCo = (term_id, course_number) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.number = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [course_number, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeKe = (term_id, keyword) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByAll = (term_id, subject_id, course_number, keyword) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.number = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [subject_id, course_number, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeSuKe = (term_id, subject_id, keyword) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [subject_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Term.getRegClassesByTeCoKe = (term_id, course_number, keyword) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - COUNT(c.id)) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.number = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false join class_enrollment ce on c.id = ce.class_id and ce.status = "ongoing" and ce.deleted = false group by cm.id, cm.class_id', {
            replacements: [course_number, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Term;
};