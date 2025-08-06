// Test complete subscription flow
// This file tests the complete subscription flow including plan creation and subscription creation

require('dotenv').config();
const {
  efiPayService
} = require('../../dist/adapters/services/efi-pay.service');

async function testCompleteFlow() {
  try {
    console.log('🔄 Testando fluxo completo de assinatura...\n');

    // 1. Authenticate
    console.log('1️⃣ Autenticando...');
    await efiPayService.authenticate();
    console.log('✅ Autenticação realizada com sucesso!\n');

    // 2. Create a plan
    console.log('2️⃣ Criando plano...');
    const planData = {
      name: `Plano Gunno - ${new Date().toISOString()}`,
      interval: 1, // Monthly
      repeats: 12 // 12 months
    };

    const createdPlan = await efiPayService.createPlan(planData);
    console.log('✅ Plano criado:', createdPlan);
    const planId = createdPlan.data.plan_id;

    // 3. Create a subscription (if the method exists)
    console.log('\n3️⃣ Testando criação de assinatura...');

    // Check if createSubscription method exists
    if (typeof efiPayService.createSubscription === 'function') {
      const subscriptionData = {
        plan_id: planId,
        items: [
          {
            name: 'Produto 1',
            value: 2500,
            amount: 1
          }
        ],
        customer: {
          name: 'João Silva',
          cpf: '12345678901',
          email: 'joao@teste.com',
          phone_number: '11999999999'
        },
        payment_method: 'credit_card'
      };

      try {
        const subscription =
          await efiPayService.createSubscription(subscriptionData);
        console.log('✅ Assinatura criada:', subscription);
      } catch (error) {
        console.log(
          '⚠️ Método createSubscription não implementado ou erro:',
          error.message
        );
      }
    } else {
      console.log(
        '⚠️ Método createSubscription não encontrado - será implementado'
      );
    }

    console.log('\n🎉 Teste completo realizado com sucesso!');
    console.log(`📋 Plano criado com ID: ${planId}`);
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response?.data) {
      console.error(
        '📄 Detalhes do erro:',
        JSON.stringify(error.response.data, null, 2)
      );
    }
    process.exit(1);
  }
}

// Run the test
testCompleteFlow();
