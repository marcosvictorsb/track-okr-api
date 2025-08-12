'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('plans', 'isTrial', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o plano é de trial/gratuito'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('plans', 'isTrial');
  }
};
