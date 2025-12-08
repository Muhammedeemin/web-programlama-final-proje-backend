module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
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
    employeeNumber: {
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
    title: {
      type: DataTypes.ENUM('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'research_assistant'),
      allowNull: false
    },
    officeLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    officeHours: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'faculty',
    timestamps: true
  });

  Faculty.associate = (models) => {
    Faculty.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Faculty.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });
  };

  return Faculty;
};

