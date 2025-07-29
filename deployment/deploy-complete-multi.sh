#!/bin/bash

# Script principal de deploy completo para ambientes múltiplos
# Produção: www.gunno.com.br
# Demonstração: demonstracao.gunno.com.br

set -e

echo "🚀 Iniciando configuração completa multi-ambiente..."
echo "🏢 Produção: www.gunno.com.br"
echo "🧪 Demo: demonstracao.gunno.com.br"

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Execute este script como root (sudo)"
    exit 1
fi

# Passo 1: Configuração inicial da VPS
echo "📋 Passo 1: Configuração inicial da VPS..."
if [ ! -f "/opt/trackokr/production" ]; then
    bash ./setup-vps.sh
    bash ./setup-multi-env.sh
else
    echo "✅ VPS já configurada, pulando configuração inicial"
fi

# Passo 2: Configurar bancos de dados
echo "📋 Passo 2: Configuração de bancos de dados..."
bash ./setup-database.sh

# Passo 3: Configurar Nginx básico
echo "📋 Passo 3: Configuração básica do Nginx..."

# Remover configuração padrão
rm -f /etc/nginx/sites-enabled/default

# Criar configuração temporária para SSL
tee /etc/nginx/sites-available/temp-ssl > /dev/null <<EOF
server {
    listen 80;
    server_name gunno.com.br www.gunno.com.br demonstracao.gunno.com.br;
    
    location / {
        return 200 "Configurando Gunno OKR...";
        add_header Content-Type text/plain;
    }
}
EOF

ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Passo 4: Configurar SSL
echo "📋 Passo 4: Configuração SSL..."
bash ./setup-ssl-multi.sh

# Passo 5: Deploy da API de Produção
echo "📋 Passo 5: Deploy da API de Produção..."
bash ./deploy-production.sh

# Passo 6: Deploy da API de Demo
echo "📋 Passo 6: Deploy da API de Demo..."
bash ./deploy-demo.sh

# Passo 7: Deploy dos Frontends
echo "📋 Passo 7: Deploy dos Frontends..."

# Frontend de Produção
if [ -n "$FRONTEND_PROD_REPO" ]; then
    echo "🎨 Fazendo deploy do Frontend de Produção..."
    
    if [ ! -d "/opt/trackokr/production/frontend/.git" ]; then
        git clone $FRONTEND_PROD_REPO /opt/trackokr/production/frontend
    else
        cd /opt/trackokr/production/frontend
        git fetch origin && git reset --hard origin/main
    fi
    
    cd /opt/trackokr/production/frontend
    npm ci
    
    # Configurar env para produção
    tee .env.production > /dev/null <<EOF
VITE_API_URL=https://www.gunno.com.br/api
VITE_APP_TITLE=Gunno OKR
VITE_APP_ENV=production
EOF
    
    npm run build
    chown -R www-data:www-data dist/
else
    echo "⚠️  FRONTEND_PROD_REPO não definido, criando placeholder..."
    mkdir -p /opt/trackokr/production/frontend/dist
    tee /opt/trackokr/production/frontend/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Gunno OKR - Produção</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { font-size: 48px; color: #4A90E2; margin-bottom: 20px; }
        .status { color: #28a745; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎯 Gunno OKR</div>
        <h1>Ambiente de Produção</h1>
        <p class="status">✅ API funcionando</p>
        <p>Sistema de gestão de OKRs em produção</p>
        <p><a href="/api/health">Verificar API</a></p>
    </div>
</body>
</html>
EOF
    chown -R www-data:www-data /opt/trackokr/production/frontend/dist/
fi

# Frontend de Demo
if [ -n "$FRONTEND_DEMO_REPO" ]; then
    echo "🎨 Fazendo deploy do Frontend de Demo..."
    
    if [ ! -d "/opt/trackokr/demo/frontend/.git" ]; then
        git clone $FRONTEND_DEMO_REPO /opt/trackokr/demo/frontend
    else
        cd /opt/trackokr/demo/frontend
        git fetch origin && git reset --hard origin/demo || git reset --hard origin/main
    fi
    
    cd /opt/trackokr/demo/frontend
    npm ci
    
    # Configurar env para demo
    tee .env.production > /dev/null <<EOF
VITE_API_URL=https://demonstracao.gunno.com.br/api
VITE_APP_TITLE=Gunno OKR - Demonstração
VITE_APP_ENV=demo
VITE_DEMO_MODE=true
EOF
    
    npm run build
    chown -R www-data:www-data dist/
else
    echo "⚠️  FRONTEND_DEMO_REPO não definido, criando placeholder..."
    mkdir -p /opt/trackokr/demo/frontend/dist
    tee /opt/trackokr/demo/frontend/dist/index.html > /dev/null <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>Gunno OKR - Demonstração</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { font-size: 48px; color: #FF6B6B; margin-bottom: 20px; }
        .status { color: #28a745; font-size: 18px; }
        .demo-banner { background: #FFF3CD; border: 1px solid #FFEAA7; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎯 Gunno OKR</div>
        <h1>Ambiente de Demonstração</h1>
        <div class="demo-banner">
            <strong>🧪 AMBIENTE DE TESTE</strong><br>
            Dados são resetados diariamente às 3h da manhã
        </div>
        <p class="status">✅ API funcionando</p>
        <p>Sistema de gestão de OKRs para demonstração</p>
        <p><strong>Login Demo:</strong> demo@gunno.com.br / Demo123!</p>
        <p><a href="/api/health">Verificar API</a></p>
    </div>
</body>
</html>
EOF
    chown -R www-data:www-data /opt/trackokr/demo/frontend/dist/
fi

# Passo 8: Configurar monitoramento
echo "📋 Passo 8: Configuração de monitoramento..."
bash ./setup-monitoring.sh

# Passo 9: Configurar scripts de manutenção
echo "📋 Passo 9: Configuração de scripts de manutenção..."

# Copiar script de reset de demo
cp reset-demo-data.sh /opt/trackokr/scripts/
chmod +x /opt/trackokr/scripts/reset-demo-data.sh
chown trackokr:trackokr /opt/trackokr/scripts/reset-demo-data.sh

# Script de backup
tee /opt/trackokr/scripts/backup-all.sh > /dev/null <<EOF
#!/bin/bash
DATE=\$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/opt/trackokr/backups"

echo "📦 Iniciando backup completo..."

# Backup bancos
mysqldump -u trackokr_prod -p\${DB_PROD_PASSWORD} track_okr_production > \$BACKUP_DIR/prod-db-\$DATE.sql
mysqldump -u trackokr_demo -p\${DB_DEMO_PASSWORD} track_okr_demo > \$BACKUP_DIR/demo-db-\$DATE.sql

# Backup arquivos
tar -czf \$BACKUP_DIR/prod-files-\$DATE.tar.gz /opt/trackokr/production/
tar -czf \$BACKUP_DIR/demo-files-\$DATE.tar.gz /opt/trackokr/demo/

# Backup configurações nginx
tar -czf \$BACKUP_DIR/nginx-config-\$DATE.tar.gz /etc/nginx/sites-available/gunno-*

# Limpar backups antigos (manter 30 dias)
find \$BACKUP_DIR -name "*.sql" -mtime +30 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completo finalizado"
EOF

chmod +x /opt/trackokr/scripts/backup-all.sh

# Agendar backups e manutenção
echo "📅 Configurando agendamentos..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/trackokr/scripts/backup-all.sh") | crontab -
(sudo -u trackokr crontab -l 2>/dev/null; echo "0 3 * * * /opt/trackokr/scripts/reset-demo-data.sh") | sudo -u trackokr crontab -

# Configurar PM2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u trackokr --hp /opt/trackokr

echo ""
echo "🎉 CONFIGURAÇÃO COMPLETA FINALIZADA!"
echo "========================================"
echo ""
echo "🌐 URLs Configuradas:"
echo "   🏢 Produção: https://www.gunno.com.br"
echo "   🧪 Demo: https://demonstracao.gunno.com.br"
echo ""
echo "📊 APIs:"
echo "   🏢 Produção: Porta 3001 (2 instâncias)"
echo "   🧪 Demo: Porta 3002 (1 instância)"
echo ""
echo "🗄️  Bancos de Dados:"
echo "   🏢 Produção: track_okr_production (Redis DB 0)"
echo "   🧪 Demo: track_okr_demo (Redis DB 1)"
echo ""
echo "📋 Status dos Serviços:"
sudo -u trackokr pm2 status
echo ""
echo "🔧 Comandos Úteis:"
echo "   📊 Status: sudo -u trackokr pm2 status"
echo "   📝 Logs Prod: sudo -u trackokr pm2 logs track-okr-production"
echo "   📝 Logs Demo: sudo -u trackokr pm2 logs track-okr-demo"
echo "   🔄 Restart Prod: sudo -u trackokr pm2 restart track-okr-production"
echo "   🔄 Restart Demo: sudo -u trackokr pm2 restart track-okr-demo"
echo "   🏥 Health Check: curl https://www.gunno.com.br/health"
echo "   🧪 Demo Health: curl https://demonstracao.gunno.com.br/health"
echo ""
echo "🔒 Segurança:"
echo "   ✅ SSL configurado para ambos domínios"
echo "   ✅ Rate limiting ativo"
echo "   ✅ Firewall configurado"
echo "   ✅ Backup automático diário"
echo ""
echo "🎯 Próximos Passos:"
echo "   1. Configure DNS para apontar os domínios para este servidor"
echo "   2. Ajuste as variáveis de ambiente nos arquivos .env"
echo "   3. Configure repositórios do frontend (FRONTEND_PROD_REPO e FRONTEND_DEMO_REPO)"
echo "   4. Teste ambos os ambientes"
echo "   5. Configure monitoramento adicional se necessário"
