#!/bin/bash

# Script para reset automático dos dados de demonstração
# Executado diariamente às 3h da manhã

DEMO_DIR="/opt/trackokr/demo"
LOG_FILE="/opt/trackokr/demo/logs/demo-reset.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] Iniciando reset dos dados de demonstração..." >> $LOG_FILE

# Backup dos dados atuais antes do reset
echo "[$TIMESTAMP] Fazendo backup dos dados atuais..." >> $LOG_FILE
mysqldump -u trackokr_demo -p${DB_DEMO_PASSWORD} track_okr_demo > /opt/trackokr/backups/demo-data-before-reset-$(date +%Y%m%d).sql

# Parar API temporariamente
echo "[$TIMESTAMP] Parando API de demonstração..." >> $LOG_FILE
sudo -u trackokr pm2 stop track-okr-demo

# Limpar dados do banco
echo "[$TIMESTAMP] Limpando dados do banco..." >> $LOG_FILE
mysql -u trackokr_demo -p${DB_DEMO_PASSWORD} track_okr_demo <<EOF
SET FOREIGN_KEY_CHECKS = 0;

-- Limpar tabelas de dados (manter estrutura)
TRUNCATE TABLE user_teams;
TRUNCATE TABLE results_keys;
TRUNCATE TABLE objectives;
TRUNCATE TABLE teams;
TRUNCATE TABLE companies;
TRUNCATE TABLE subscriptions;
TRUNCATE TABLE users;

-- Resetar auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE companies AUTO_INCREMENT = 1;
ALTER TABLE teams AUTO_INCREMENT = 1;
ALTER TABLE objectives AUTO_INCREMENT = 1;
ALTER TABLE results_keys AUTO_INCREMENT = 1;
ALTER TABLE subscriptions AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;
EOF

# Limpar cache Redis do demo (database 1)
echo "[$TIMESTAMP] Limpando cache Redis..." >> $LOG_FILE
redis-cli -n 1 FLUSHDB

# Limpar arquivos de upload de demo
echo "[$TIMESTAMP] Limpando arquivos de upload..." >> $LOG_FILE
if [ -d "/opt/trackokr/demo/uploads" ]; then
    find /opt/trackokr/demo/uploads -type f -not -name '.gitkeep' -delete
fi

# Recriar dados de demonstração
echo "[$TIMESTAMP] Recriando dados de demonstração..." >> $LOG_FILE
cd $DEMO_DIR/api

# Executar seeder de demo (se existir)
if [ -f "scripts/seed-demo.js" ]; then
    node scripts/seed-demo.js >> $LOG_FILE 2>&1
else
    # Criar dados básicos via SQL
    mysql -u trackokr_demo -p${DB_DEMO_PASSWORD} track_okr_demo <<EOF
-- Inserir empresa demo
INSERT INTO companies (name, email, phone, cnpj, created_at, updated_at) VALUES 
('Empresa Demonstração', 'contato@gunno.com.br', '(11) 99999-9999', '12.345.678/0001-90', NOW(), NOW());

-- Inserir usuário demo
INSERT INTO users (name, email, password, role, company_id, is_active, created_at, updated_at) VALUES 
('Usuário Demo', 'demo@gunno.com.br', '\$2b\$10\$demo.hash.aqui', 'admin', 1, 1, NOW(), NOW());

-- Inserir time demo
INSERT INTO teams (name, description, company_id, created_at, updated_at) VALUES 
('Time de Vendas', 'Time responsável pelas vendas da empresa', 1, NOW(), NOW());

-- Inserir objetivo demo
INSERT INTO objectives (title, description, start_date, end_date, status, team_id, user_id, created_at, updated_at) VALUES 
('Aumentar Vendas em 50%', 'Objetivo de crescimento para o próximo trimestre', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 'active', 1, 1, NOW(), NOW());

-- Inserir resultados-chave demo
INSERT INTO results_keys (title, description, target_value, current_value, unit, objective_id, created_at, updated_at) VALUES 
('Novos Clientes', 'Conquistar novos clientes', 100, 35, 'quantidade', 1, NOW(), NOW()),
('Receita Mensal', 'Aumentar receita mensal', 50000, 18500, 'currency', 1, NOW(), NOW()),
('Taxa de Conversão', 'Melhorar taxa de conversão do funil', 15, 8.5, 'percentage', 1, NOW(), NOW());

-- Associar usuário ao time
INSERT INTO user_teams (user_id, team_id, created_at, updated_at) VALUES 
(1, 1, NOW(), NOW());
EOF
fi

# Reiniciar API
echo "[$TIMESTAMP] Reiniciando API de demonstração..." >> $LOG_FILE
sudo -u trackokr pm2 start track-okr-demo

# Aguardar alguns segundos para a API inicializar
sleep 10

# Verificar se a API está respondendo
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/health || echo "FAIL")
if [ "$API_STATUS" = "200" ]; then
    echo "[$TIMESTAMP] ✅ Reset concluído com sucesso! API respondendo normalmente." >> $LOG_FILE
else
    echo "[$TIMESTAMP] ❌ Problema no reset! API não está respondendo. Status: $API_STATUS" >> $LOG_FILE
fi

# Limpar backups antigos (manter apenas últimos 7 dias)
find /opt/trackokr/backups -name "demo-data-before-reset-*.sql" -mtime +7 -delete

echo "[$TIMESTAMP] Reset de dados de demonstração finalizado." >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE
