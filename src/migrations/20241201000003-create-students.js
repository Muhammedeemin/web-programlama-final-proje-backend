'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('students', {
      id: {
        type: Sequelize.CHAR(36),
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      studentNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      departmentId: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'departments',
          key: 'id'
        }
      },
      enrollmentYear: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gpa: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00
      },
      isScholarship: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      walletBalance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('students');
  }
};

