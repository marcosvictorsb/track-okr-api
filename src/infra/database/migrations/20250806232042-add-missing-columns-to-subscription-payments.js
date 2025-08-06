'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar colunas faltantes na tabela subscription_payments
    await queryInterface.addColumn('subscription_payments', 'txid', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'ID da transação (PIX, etc.)'
    });

    await queryInterface.addColumn('subscription_payments', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Descrição do pagamento'
    });

    // Adicionar status 'failed' e 'overdue' ao ENUM se não existirem
    await queryInterface.changeColumn('subscription_payments', 'status', {
      type: Sequelize.ENUM(
        'pending',
        'paid',
        'cancelled',
        'failed',
        'refunded',
        'overdue',
        'expired'
      ),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover colunas adicionadas
    await queryInterface.removeColumn('subscription_payments', 'txid');
    await queryInterface.removeColumn('subscription_payments', 'description');

    // Reverter o ENUM do status
    await queryInterface.changeColumn('subscription_payments', 'status', {
      type: Sequelize.ENUM(
        'pending',
        'paid',
        'cancelled',
        'expired',
        'refunded'
      ),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
