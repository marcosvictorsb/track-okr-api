'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('plans', 'secret', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment:
        'Secret único para identificar o plano nos webhooks de pagamento',
      after: 'isTrial'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('plans', 'secret');
  }
};
