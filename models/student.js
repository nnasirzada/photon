module.exports = (sequelize, DataTypes) => {

    const Student = sequelize.define('Student', {
        user_id: {
            type: DataTypes.INTEGER(10).UNSIGNED,
            primaryKey: true
        },
        status_academic: {
            type: DataTypes.ENUM('continuing', 'graduated', 'suspended', 'expelled'),
            defaultValue: 'continuing'
        },
        major_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
        },
        admit_term_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
        },
        graduation_term_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        deleted: {
            type: DataTypes.BOOLEAN(),
            defaultValue: false
        }
    }, {tableName: 'student'});

    Student.getAttendanceByTerm = (student_id, term_id) => {
        return sequelize.query('Select distinct cm.id, group_concat(n.date separator ", ") as dates, cm.id, co.number as crn, s.code as subject, co.name as name, c.section, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, time_format(cm.start_time, "%H:%i") as start_time, time_format(cm.end_time, "%H:%i") as end_time, n.missed, m.total_classes from (select distinct a.class_id as class_id, a.class_meeting_id as class_meeting_id, (case when b.missed is null then 0 else b.missed end) as missed, date from class_attendance a join (select class_id, class_meeting_id, count(class_id) as total_classes, count(status) as missed from class_attendance where deleted = false and student_id = ? and status = \'absent\' group by class_meeting_id) b on a.status = "absent" and a.student_id = ? and a.deleted = false and a.class_meeting_id = b.class_meeting_id) n join (select class_meeting_id, count(class_meeting_id) as total_classes from class_attendance where deleted = false group by class_meeting_id) m on n.class_meeting_id = m.class_meeting_id join (select id, course_id, section from class where deleted = false and part_of_term_id in (select id from part_of_term where deleted = false and term_id = ?)) c on n.class_id = c.id join course co on co.deleted = false and c.course_id = co.id join subject s on s.deleted = false and co.subject_id = s.id join class_meeting cm on cm.deleted = false and cm.id = n.class_meeting_id group by cm.id', {
            replacements: [student_id, student_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getCreditHoursByTerm = (student_id, class_id, term_id) => {
        return sequelize.query('select (ce.total * FORMAT(co.credit_hours, 0)) as tch from (select count(class_id) as total from class_enrollment where deleted = false and status = "ongoing" and student_id = ? group by student_id) ce join (select credit_hours from course where deleted = false and id in (select course_id from class where deleted = false and status = "open" and id = ? and part_of_term_id in (select id from part_of_term where deleted = false and term_id = ?))) co', {
            replacements: [student_id, class_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getProfileData = student_id => {
        return sequelize.query('Select us.firstname as firstname, us.lastname as lastname, us.patronymic as patronymic, us.sex as sex, us.address as address, us.email as email, us.date_of_birth as date_of_birth, us.image_path as image_path, us.type as type, us.status_login as status_login, st.status_academic as status_academic, ma.name as major_name, sc.name as school_name, pr.name as program_name, te1.name as admit_term_name, te2.name as graduation_term_name from user us join student st on us.id = ? and us.id = st.user_id and us.deleted = false and st.deleted = false join major ma on ma.deleted = false and st.major_id = ma.id join school sc on sc.deleted = false and ma.school_id = sc.id join program pr on pr.deleted = false and ma.program_id = pr.id join (select st.user_id as user_id, te.name as name from student st join term te on st.deleted = false and te.deleted = false and st.user_id = ? and st.admit_term_id = te.id) te1 join (select st.user_id as user_id, te.name as name from student st join term te on st.deleted = false and te.deleted = false and st.user_id = ? and st.graduation_term_id = te.id) te2 on te1.user_id = te2.user_id\n', {
            replacements: [student_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Student;
};