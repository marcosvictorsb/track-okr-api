#!/usr/bin/env node

/**
 * Script para testar a conexão com a EFI     const planData = {
      name: `Plano Teste - ${new Date().toISOString()}`,
      interval: 1, // 1 mês (máximo 24)
      repeats: 12, // 12 meses (mínimo 2)
      value: 2500, // R$ 25,00 em centavos
      metadata: {
        custom_id: 'test-plan-001',
        notification_url: 'http://localhost:3000/webhook/efi-pay'
      }
    };

    const createdPlan = await efiPayService.createPlan(planData);plano
 *
 * Uso: node test-efi-connection.js
 */

require('dotenv').config();
const {
  efiPayService
} = require('../../dist/adapters/services/efi-pay.service');

async function testEfiConnection() {
  console.log('🔄 Testando conexão com EFI Pay...\n');

  try {
    // Verificar variáveis de ambiente
    const requiredEnvVars = ['EFI_CLIENT_ID', 'EFI_CLIENT_SECRET'];
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      console.error('❌ Variáveis de ambiente não configuradas:');
      missingVars.forEach((varName) => {
        console.error(`   - ${varName}`);
      });
      console.error('\nConfigurações necessárias no .env:');
      console.error('EFI_SANDBOX=true');
      console.error('EFI_CLIENT_ID=seu_client_id');
      console.error('EFI_CLIENT_SECRET=seu_client_secret');
      process.exit(1);
    }

    // Testar conexão
    console.log('1️⃣ Testando autenticação...');
    const result = await efiPayService.testConnection();

    if (result.success) {
      console.log('✅ Conexão com EFI Pay estabelecida com sucesso!');
      console.log(
        `📡 Ambiente: ${process.env.EFI_SANDBOX === 'true' ? 'Sandbox (Teste)' : 'Produção'}`
      );
      console.log(
        `🔗 Base URL: ${process.env.EFI_SANDBOX === 'true' ? 'https://cobrancas-h.api.efipay.com.br' : 'https://cobrancas.api.efipay.com.br'}`
      );

      // Tentar listar planos existentes
      console.log('\n2️⃣ Testando listagem de planos...');
      try {
        const plans = await efiPayService.listPlans(0, 5);
        console.log(`✅ Encontrados ${plans.data?.length || 0} planos`);

        if (plans.data && plans.data.length > 0) {
          console.log('\n📋 Planos encontrados:');
          plans.data.forEach((plan, index) => {
            console.log(
              `   ${index + 1}. ${plan.name} - R$ ${(plan.value / 100).toFixed(2)}`
            );
          });
        }
      } catch (listError) {
        console.log(
          '⚠️ Erro ao listar planos (pode ser normal se não houver planos):',
          listError.message
        );
      }

      // Tentar criar um plano de teste
      console.log('\n3️⃣ Testando criação de plano...');
      try {
        const planData = {
          name: `Plano Teste - ${new Date().toISOString()}`,
          interval: 1, // 1 mês
          repeats: 12 // 12 meses
        };

        const createdPlan = await efiPayService.createPlan(planData);
        console.log('✅ Plano criado com sucesso!');
        console.log('📄 Dados do plano:', JSON.stringify(createdPlan, null, 2));
      } catch (createError) {
        console.log('⚠️ Erro ao criar plano:', createError.message);
      }
    } else {
      console.error('❌ Falha na conexão:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);

    if (
      error.message.includes('ENOTFOUND') ||
      error.message.includes('ECONNREFUSED')
    ) {
      console.error('\n💡 Dicas:');
      console.error('   - Verifique sua conexão com a internet');
      console.error('   - Confirme se as URLs da EFI Pay estão acessíveis');
    } else if (
      error.message.includes('401') ||
      error.message.includes('authentication')
    ) {
      console.error('\n💡 Dicas:');
      console.error('   - Verifique se EFI_CLIENT_ID está correto');
      console.error('   - Verifique se EFI_CLIENT_SECRET está correto');
      console.error(
        '   - Confirme se está usando credenciais do ambiente correto (sandbox/produção)'
      );
    }

    process.exit(1);
  }
}

// Executar teste
testEfiConnection();
