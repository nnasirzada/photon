module.exports = (sequelize, DataTypes) => {

    const Term = sequelize.define('Term', {
        id: {
            type: DataTypes.INTEGER(5).UNSIGNED,
            primaryKey: true,
            autoIncrement: true
        },
        year: {
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
    }, { tableName: 'term' });

    Term.getStudentTerms = student_id => {
        return sequelize.query('SELECT * FROM term WHERE deleted = 0 AND id IN (SELECT term_id FROM part_of_term WHERE deleted = 0 AND id IN (SELECT part_of_term_id FROM class WHERE deleted = 0 AND id IN (SELECT class_id FROM class_enrollment WHERE deleted = 0 AND student_id = ?))) ORDER BY id DESC', {
            replacements: [student_id],
            type: sequelize.QueryTypes.SELECT
        });
    };

    return Term;
};