#!/bin/bash

# Script de deploy para ambiente de PRODUÇÃO
# Domínio: www.gunno.com.br

set -e

PROD_DIR="/opt/trackokr/production"
REPO_URL="https://github.com/marcosvictorsb/track-okr-api.git"
BRANCH="main"

echo "🏢 Iniciando deploy de PRODUÇÃO..."
echo "🌐 Domínio: www.gunno.com.br"
echo "📊 Porta: 3001"

# Backup da versão atual
if [ -d "$PROD_DIR/api" ]; then
    echo "📦 Fazendo backup da versão atual..."
    sudo cp -r $PROD_DIR/api /opt/trackokr/backups/production-api-backup-$(date +%Y%m%d-%H%M%S)
fi

# Clone/pull do repositório
if [ ! -d "$PROD_DIR/api/.git" ]; then
    echo "📥 Clonando repositório..."
    sudo git clone $REPO_URL $PROD_DIR/api
else
    echo "📥 Atualizando repositório..."
    cd $PROD_DIR/api
    sudo git fetch origin
    sudo git reset --hard origin/$BRANCH
fi

cd $PROD_DIR/api

# Instalar dependências
echo "📦 Instalando dependências..."
sudo npm ci --production

# Build da aplicação
echo "🔨 Compilando TypeScript..."
sudo npm run build

# Configurar variáveis de ambiente para produção
echo "⚙️  Configurando variáveis de ambiente..."
sudo tee .env > /dev/null <<EOF
# Produção - www.gunno.com.br
NODE_ENV=production
PORT=3001
API_BASE_URL=https://www.gunno.com.br/api

# Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=track_okr_production
DB_USER=trackokr_prod
DB_PASSWORD=${DB_PROD_PASSWORD:-CONFIGURE_SENHA_AQUI}

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET=${JWT_SECRET:-CONFIGURE_CHAVE_JWT_AQUI}
JWT_EXPIRES_IN=7d

# Email
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=587
EMAIL_USER=resend
EMAIL_PASSWORD=${EMAIL_PASSWORD:-CONFIGURE_RESEND_KEY_AQUI}
EMAIL_FROM=noreply@gunno.com.br

# Segurança
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://www.gunno.com.br

# Logs
LOG_LEVEL=info
LOG_FILE=/opt/trackokr/production/logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Uploads
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/opt/trackokr/production/uploads
EOF

# Executar migrações
echo "🗄️  Executando migrações do banco..."
sudo npm run migration

# Configurar permissões
sudo chown -R trackokr:trackokr $PROD_DIR

# Parar aplicação atual (se estiver rodando)
echo "⏹️  Parando aplicação atual..."
sudo -u trackokr pm2 stop track-okr-production || true

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação de produção..."
sudo -u trackokr pm2 start /opt/trackokr/production/api/deployment/ecosystem.production.json

# Salvar configuração do PM2
sudo -u trackokr pm2 save

echo "✅ Deploy de PRODUÇÃO concluído!"
echo ""
echo "📊 Status da aplicação:"
sudo -u trackokr pm2 status track-okr-production
echo ""
echo "🌐 Acesso: https://www.gunno.com.br"
echo "📊 Monitoramento: sudo -u trackokr pm2 monit"
echo "📝 Logs: sudo -u trackokr pm2 logs track-okr-production"
