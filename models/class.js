module.exports = (sequelize, DataTypes) => {

    const Class = sequelize.define('Class', {
        id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        course_id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED
        },
        instructor_id: {
            type: DataTypes.INTEGER(10).UNSIGNED
        },
        part_of_term_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        max_enrollment: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        section: {
            type: DataTypes.STRING(191)
        },
        status: {
            type: DataTypes.ENUM('open', 'closed')
        },
        deleted: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        }
    }, {tableName: 'class'});

    Class.getRegClassesByTerm = (term_id, student_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeSuCo = (term_id, subject_id, course_number, student_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.number = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [subject_id, course_number, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeSu = (term_id, subject_id, student_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [subject_id, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeCo = (term_id, course_number, student_id) => {
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.number = ? and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [course_number, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeKe = (term_id, keyword, student_id) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByAll = (term_id, subject_id, course_number, keyword, student_id) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.number = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [subject_id, course_number, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeSuKe = (term_id, subject_id, keyword, student_id) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and s.id = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [subject_id, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Class.getRegClassesByTeCoKe = (term_id, course_number, keyword, student_id) => {
        keyword = keyword.replace(/\s/g, "%");
        return sequelize.query('Select DISTINCT c.id, ce.student_id, ce.enroll_status, s.code, co.number, co.name, c.section, co.credit_hours as hours, concat(u.firstname, " ", u.lastname) as instructor, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time, c.max_enrollment, (c.max_enrollment - ce2.total) as rem_enrollment from course co join subject s on co.subject_id = s.id and co.number = ? and co.name like "%' + keyword + '%" and co.deleted = false and s.deleted = false join class c on co.id = c.course_id and c.status = "open" and c.deleted = false join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join instructor i on c.instructor_id = i.user_id and i.status = "active" and i.deleted = false join user u on i.user_id = u.id and u.deleted = false join class_meeting cm on cm.class_id = c.id and cm.deleted = false left join (select student_id, (case when student_id = ? then 1 else 0 end) as enroll_status, class_id from class_enrollment where student_id = ? and deleted = false and status = "ongoing" group by class_id) ce on c.id = ce.class_id left join (select class_id, count(class_id) as total from class_enrollment where status = \'ongoing\' and deleted = false group by class_id) ce2 on c.id = ce2.class_id group by cm.id, cm.class_id', {
            replacements: [course_number, term_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Class;
};