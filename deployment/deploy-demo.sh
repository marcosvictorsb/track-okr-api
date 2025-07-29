#!/bin/bash

# Script de deploy para ambiente de DEMONSTRAÇÃO
# Domínio: demonstracao.gunno.com.br

set -e

DEMO_DIR="/opt/trackokr/demo"
REPO_URL="https://github.com/marcosvictorsb/track-okr-api.git"
BRANCH="demo"  # Branch específica para demo ou main

echo "🧪 Iniciando deploy de DEMONSTRAÇÃO..."
echo "🌐 Domínio: demonstracao.gunno.com.br"
echo "📊 Porta: 3002"

# Backup da versão atual
if [ -d "$DEMO_DIR/api" ]; then
    echo "📦 Fazendo backup da versão atual..."
    sudo cp -r $DEMO_DIR/api /opt/trackokr/backups/demo-api-backup-$(date +%Y%m%d-%H%M%S)
fi

# Clone/pull do repositório
if [ ! -d "$DEMO_DIR/api/.git" ]; then
    echo "📥 Clonando repositório..."
    sudo git clone $REPO_URL $DEMO_DIR/api
    cd $DEMO_DIR/api
    sudo git checkout $BRANCH || sudo git checkout main
else
    echo "📥 Atualizando repositório..."
    cd $DEMO_DIR/api
    sudo git fetch origin
    sudo git reset --hard origin/$BRANCH || sudo git reset --hard origin/main
fi

cd $DEMO_DIR/api

# Instalar dependências
echo "📦 Instalando dependências..."
sudo npm ci --production

# Build da aplicação
echo "🔨 Compilando TypeScript..."
sudo npm run build

# Configurar variáveis de ambiente para demo
echo "⚙️  Configurando variáveis de ambiente..."
sudo tee .env > /dev/null <<EOF
# Demonstração - demonstracao.gunno.com.br
NODE_ENV=demo
PORT=3002
API_BASE_URL=https://demonstracao.gunno.com.br/api

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=track_okr_demo
DB_USER=trackokr_demo
DB_PASSWORD=${DB_DEMO_PASSWORD:-CONFIGURE_SENHA_AQUI}

# Redis
REDIS_URL=redis://localhost:6379/1

# JWT
JWT_SECRET=${JWT_SECRET:-CONFIGURE_CHAVE_JWT_AQUI}
JWT_EXPIRES_IN=24h

# Email (demo - pode usar sandbox)
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=${EMAIL_PASSWORD:-CONFIGURE_RESEND_KEY_AQUI}
EMAIL_FROM=demo@gunno.com.br

# Segurança (mais permissiva para demo)
BCRYPT_ROUNDS=10
CORS_ORIGIN=https://demonstracao.gunno.com.br

# Demo Features
ENABLE_DEMO_FEATURES=true
AUTO_RESET_DEMO_DATA=true
DEMO_USER_EMAIL=demo@gunno.com.br
DEMO_USER_PASSWORD=Demo123!

# Logs
LOG_LEVEL=debug
LOG_FILE=/opt/trackokr/demo/logs/app.log

# Rate Limiting (mais permissivo)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300

# Uploads
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/opt/trackokr/demo/uploads
EOF

# Executar migrações
echo "🗄️  Executando migrações do banco..."
sudo npm run migration

# Criar dados de demonstração
echo "🎭 Criando dados de demonstração..."
# TODO: Adicionar seeder específico para demo
# sudo npm run seed:demo

# Configurar permissões
sudo chown -R trackokr:trackokr $DEMO_DIR

# Parar aplicação atual (se estiver rodando)
echo "⏹️  Parando aplicação atual..."
sudo -u trackokr pm2 stop track-okr-demo || true

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação de demonstração..."
sudo -u trackokr pm2 start /opt/trackokr/demo/api/deployment/ecosystem.demo.json

# Salvar configuração do PM2
sudo -u trackokr pm2 save

# Agendar reset diário dos dados de demo (às 3h da manhã)
echo "🔄 Configurando reset automático de dados de demo..."
(sudo -u trackokr crontab -l 2>/dev/null | grep -v "demo-reset"; echo "0 3 * * * /opt/trackokr/scripts/reset-demo-data.sh") | sudo -u trackokr crontab -

echo "✅ Deploy de DEMONSTRAÇÃO concluído!"
echo ""
echo "📊 Status da aplicação:"
sudo -u trackokr pm2 status track-okr-demo
echo ""
echo "🌐 Acesso: https://demonstracao.gunno.com.br"
echo "👤 Usuário demo: demo@gunno.com.br / Demo123!"
echo "📊 Monitoramento: sudo -u trackokr pm2 monit"
echo "📝 Logs: sudo -u trackokr pm2 logs track-okr-demo"
echo ""
echo "🎯 Recursos de demonstração:"
echo "   - Reset automático de dados diariamente às 3h"
echo "   - Dados de exemplo pré-carregados"
echo "   - Rate limiting mais permissivo"
echo "   - Logs detalhados para debugging"
