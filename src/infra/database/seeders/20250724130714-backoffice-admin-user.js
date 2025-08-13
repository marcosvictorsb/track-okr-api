'use strict';

const bcryptjs = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se já existe usuário admin
    const existingAdmin = await queryInterface.sequelize.query(
      "SELECT id FROM backoffice_users WHERE email = 'admin@gunno.io' LIMIT 1",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingAdmin.length > 0) {
      console.log('Usuário admin já existe, pulando criação.');
      return;
    }

    // Hash da senha padrão
    const hashedPassword = await bcryptjs.hash('admin123!@#', 12);

    // Criar usuário admin padrão
    await queryInterface.bulkInsert(
      'backoffice_users',
      [
        {
          name: 'Administrador do Sistema',
          email: 'admin@gunno.io',
          password: hashedPassword,
          role: 'admin',
          permissions: JSON.stringify({
            subscription_plans: true,
            payments: true,
            users: true,
            stats: true,
            system: true
          }),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ],
      {}
    );

    console.log('Usuário admin criado com sucesso!');
    console.log('Email: admin@gunno.io');
    console.log('Senha: admin123!@#');
    console.log('IMPORTANTE: Altere a senha após o primeiro login!');
  },

  async down(queryInterface, Sequelize) {
    // Remover usuário admin
    await queryInterface.bulkDelete(
      'backoffice_users',
      {
        email: 'admin@gunno.io'
      },
      {}
    );
  }
};
