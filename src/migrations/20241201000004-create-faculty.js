'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('faculty', {
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
      employeeNumber: {
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
      title: {
        type: Sequelize.ENUM('professor', 'associate_professor', 'assistant_professor', 'lecturer', 'research_assistant'),
        allowNull: false
      },
      officeLocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      officeHours: {
        type: Sequelize.STRING,
        allowNull: true
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
    await queryInterface.dropTable('faculty');
  }
};

