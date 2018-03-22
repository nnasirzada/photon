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

    return ClassMeeting;
};