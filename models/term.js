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

    return Term;
};