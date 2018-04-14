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
    }, { tableName: 'student' });

    Student.getAttendance = (student_id, term_id) => {
        return sequelize.query('Select distinct cm.id, group_concat(n.date separator ", ") as dates, cm.id, co.number as crn, s.code as subject, co.name as name, c.section, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, time_format(cm.start_time, "%H:%i") as start_time, time_format(cm.end_time, "%H:%i") as end_time, n.missed, m.total_classes from (select distinct a.class_id as class_id, a.class_meeting_id as class_meeting_id, (case when b.missed is null then 0 else b.missed end) as missed, date from class_attendance a join (select class_id, class_meeting_id, count(class_id) as total_classes, count(status) as missed from class_attendance where deleted = false and student_id = ? and status = \'absent\' group by class_meeting_id) b on a.status = "absent" and a.student_id = ? and a.deleted = false and a.class_meeting_id = b.class_meeting_id) n join (select class_meeting_id, count(class_meeting_id) as total_classes from class_attendance where deleted = false group by class_meeting_id) m on n.class_meeting_id = m.class_meeting_id join (select id, course_id, section from class where deleted = false and part_of_term_id in (select id from part_of_term where deleted = false and term_id = ?)) c on n.class_id = c.id join course co on co.deleted = false and c.course_id = co.id join subject s on s.deleted = false and co.subject_id = s.id join class_meeting cm on cm.deleted = false and cm.id = n.class_meeting_id group by cm.id', {
            replacements: [student_id, student_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getCreditHours = (student_id, class_id, term_id) => {
        return sequelize.query('select (ce.total * FORMAT(co.credit_hours, 0)) as tch from (select count(class_id) as total from class_enrollment where deleted = false and status = "ongoing" and student_id = ? group by student_id) ce join (select credit_hours from course where deleted = false and id in (select course_id from class where deleted = false and status = "open" and id = ? and part_of_term_id in (select id from part_of_term where deleted = false and term_id = ?))) co', {
            replacements: [student_id, class_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getProfileData = student_id => {
        return sequelize.query('Select us.firstname as firstname, us.lastname as lastname, us.patronymic as patronymic, CONCAT(UCASE(LEFT(sex, 1)), SUBSTRING(sex, 2)) as sex, us.address as address, us.email as email, us.date_of_birth as date_of_birth, us.image_path as image_path, us.type as type, us.status_login as status_login, CONCAT(UCASE(LEFT(status_academic, 1)), SUBSTRING(status_academic, 2)) as status_academic, ma.name as major_name, sc.name as school_name, pr.name as program_name, te1.name as admit_term_name, te2.name as graduation_term_name from user us join student st on us.id = ? and us.id = st.user_id and us.deleted = false and st.deleted = false join major ma on ma.deleted = false and st.major_id = ma.id join school sc on sc.deleted = false and ma.school_id = sc.id join program pr on pr.deleted = false and ma.program_id = pr.id join (select st.user_id as user_id, te.name as name from student st join term te on st.deleted = false and te.deleted = false and st.user_id = ? and st.admit_term_id = te.id) te1 join (select st.user_id as user_id, te.name as name from student st left join term te on st.deleted = 0 and st.user_id = ? and st.graduation_term_id = te.id) te2 on te1.user_id = te2.user_id', {
            replacements: [student_id, student_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getUnofficialTranscript = student_id => {
        return sequelize.query('select cl.id, co.name course_name, t.name term_name from class_enrollment ce left join class cl on ce.class_id = cl.id and student_id = ? join course co on cl.course_id = co.id left join part_of_term pot on cl.part_of_term_id = pot.id left join term t on pot.id = t.id order by t.start_date', {
            replacements: [student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getEnrolledClasses = (student_id, term_id) => {
        return sequelize.query('SELECT pt.term_id AS term_id, cl.id AS class_id, su.code AS subject_code, co.number AS course_number, co.name AS course_name, cl.section AS course_section, sc.code AS school_code, co.credit_hours AS credit_hours, pr.name AS level FROM class_enrollment ce INNER JOIN class cl ON ce.deleted = false AND ce.student_id = ? AND cl.deleted = 0 AND ce.class_id = cl.id INNER JOIN course co ON co.deleted = false AND cl.course_id = co.id INNER JOIN part_of_term pt ON cl.part_of_term_id = pt.id AND pt.term_id = ? INNER JOIN subject su ON co.subject_id = su.id INNER JOIN program pr ON co.program_id = pr.id INNER JOIN school sc ON co.school_id = sc.id', {
            replacements: [student_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getClasses = (student_id, term_id) => {
        return sequelize.query('Select distinct ce.class_id as class_id from class_enrollment ce join class cl on ce.deleted = false and cl.deleted = false and ce.student_id = ? and ce.class_id = cl.id join part_of_term pt on pt.deleted = false and cl.part_of_term_id = pt.id and pt.term_id = ?', {
            replacements: [student_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getGrades = (student_id, class_id) => {
        return sequelize.query('Select ge.id as geid, gc.name as title, concat(ge.percentage, \' / 100.00\') as score_outof, ge.percentage as percentage, gc.weight as weight, (select gs.grade_letter from grade_scale gs where gs.deleted = 0 and ge.percentage > gs.min_percents order by gs.min_percents desc limit 1) as letter_grade from grade_component gc INNER JOIN grade_entry ge on gc.deleted = 0 and gc.class_id = ? and gc.id = ge.component_id and ge.student_id = ?', {
            replacements: [class_id, student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    Student.getFinalGrades = (student_id, class_id) => {
        return sequelize.query("Select gs.grade_letter as final_grade, ce.grade_percents as final_percent from class_enrollment ce join grade_scale gs on ce.deleted = false and gs.deleted = false and ce.student_id = ? and ce.class_id = ? and ce.grade_id = gs.id", {
            replacements: [student_id, class_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Student;
};