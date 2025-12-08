module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    studentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    departmentId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'departments',
        key: 'id'
      }
    },
    enrollmentYear: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 4.00
      }
    },
    isScholarship: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    walletBalance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  Student.associate = (models) => {
    Student.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Student.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  };

  return Student;
};

