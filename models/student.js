module.exports = (sequelize, DataTypes) => {

    const Student = sequelize.define('Student', {
        user_id: {
            type: DataTypes.INTEGER(10).UNSIGNED.ZEROFILL,
            primaryKey: true
        },
        status: {
            type: DataTypes.ENUM('continuing', 'graduated', 'suspended', 'expelled'),
            defaultValue: 'continuing'
        },
        major_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
        },
        class_level_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
        },
        admit_term_id: {
            type: DataTypes.SMALLINT(5).UNSIGNED,
        },
        graduation_term_id: {
            type: DataTypes.SMALLINT(6).UNSIGNED,
            allowNull: true,
            defaultValue: null
        }
    }, {tableName: 'student'});

    Student.getOpenTerms = user_id => {
        return sequelize.query('SELECT * FROM term WHERE status="open"', {
            replacements: [user_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Student;
};