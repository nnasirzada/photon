module.exports = (sequelize, DataTypes) => {

    const ClassMeeting = sequelize.define('ClassMeeting', {
        id: {
            type: DataTypes.BIGINT(20).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        class_id: {
            type: DataTypes.MEDIUMINT(8).UNSIGNED
        },
        room_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED
        },
        monday: {
            type: DataTypes.BOOLEAN
        },
        tuesday: {
            type: DataTypes.BOOLEAN
        },
        wednesday: {
            type: DataTypes.BOOLEAN
        },
        thursday: {
            type: DataTypes.BOOLEAN
        },
        friday: {
            type: DataTypes.BOOLEAN
        },
        saturday: {
            type: DataTypes.BOOLEAN
        },
        sunday: {
            type: DataTypes.BOOLEAN
        },
        start_time: {
            type: DataTypes.TIME
        },
        end_time: {
            type: DataTypes.TIME
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, { tableName: 'class_meeting' });

    ClassMeeting.getScheduleByStu = (student_id, term_id) => {
        return sequelize.query('select DISTINCT ce.class_id, cm.monday, cm.tuesday, cm.wednesday, cm.thursday, cm.friday, cm.saturday, cm.sunday, concat(time_format(cm.start_time, "%H:%i"), " - ", time_format(cm.end_time, "%H:%i")) as time from (select class_id from class_enrollment where student_id = ? and status = "ongoing" and deleted = false) ce join class c on ce.class_id = c.id and c.deleted = false and c.status = "open" join part_of_term pt on c.part_of_term_id = pt.id and pt.deleted = false and pt.term_id = ? join class_meeting cm on c.id = cm.class_id and cm.deleted = false group by cm.id, cm.class_id', {
            replacements: [student_id, term_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    ClassMeeting.getScheduleByCid = (class_id) => {
        return sequelize.query('select class_id, monday, tuesday, wednesday, thursday, friday, saturday, sunday, concat(time_format(start_time, "%H:%i"), " - ", time_format(end_time, "%H:%i")) as time from class_meeting where deleted = false and class_id = ?', {
            replacements: [class_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return ClassMeeting;
};