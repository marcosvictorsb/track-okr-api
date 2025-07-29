#!/bin/bash

# Script para configurar SSL para ambos os domínios

PROD_DOMAIN="www.gunno.com.br"
DEMO_DOMAIN="demonstracao.gunno.com.br"
EMAIL="contato@gunno.com.br"

echo "🔒 Configurando SSL para ambos os domínios..."

# Instalar Certbot
echo "📦 Instalando Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Verificar se os domínios estão apontando para o servidor
echo "🌐 Verificando DNS dos domínios..."
echo "Verificando $PROD_DOMAIN..."
nslookup $PROD_DOMAIN

echo "Verificando $DEMO_DOMAIN..."
nslookup $DEMO_DOMAIN

# Configurar nginx sites temporários para validação
echo "📝 Configurando sites temporários para validação SSL..."

# Site temporário para produção
sudo tee /etc/nginx/sites-available/temp-production > /dev/null <<EOF
server {
    listen 80;
    server_name gunno.com.br www.gunno.com.br;
    
    location / {
        return 200 "Gunno OKR - Produção - Configurando SSL...";
        add_header Content-Type text/plain;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

# Site temporário para demo
sudo tee /etc/nginx/sites-available/temp-demo > /dev/null <<EOF
server {
    listen 80;
    server_name demonstracao.gunno.com.br;
    
    location / {
        return 200 "Gunno OKR - Demonstração - Configurando SSL...";
        add_header Content-Type text/plain;
    }
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
}
EOF

# Ativar sites temporários
sudo ln -sf /etc/nginx/sites-available/temp-production /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/temp-demo /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx

# Criar diretório para challenge
sudo mkdir -p /var/www/html/.well-known/acme-challenge

# Obter certificado SSL para produção
echo "🔐 Obtendo certificado SSL para PRODUÇÃO ($PROD_DOMAIN)..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    -d gunno.com.br \
    -d www.gunno.com.br \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Obter certificado SSL para demo
echo "🔐 Obtendo certificado SSL para DEMONSTRAÇÃO ($DEMO_DOMAIN)..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/html \
    -d demonstracao.gunno.com.br \
    --email $EMAIL \
    --agree-tos \
    --non-interactive

# Remover sites temporários
sudo rm -f /etc/nginx/sites-enabled/temp-production
sudo rm -f /etc/nginx/sites-enabled/temp-demo

# Instalar configurações finais do nginx
echo "📝 Instalando configurações finais do Nginx..."
sudo cp nginx-production.conf /etc/nginx/sites-available/gunno-production
sudo cp nginx-demo.conf /etc/nginx/sites-available/gunno-demo

# Ativar sites finais
sudo ln -sf /etc/nginx/sites-available/gunno-production /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/gunno-demo /etc/nginx/sites-enabled/

# Atualizar configuração principal do nginx com rate limiting
echo "⚙️  Configurando rate limiting..."
sudo cp nginx-rate-limiting.conf /etc/nginx/conf.d/rate-limiting.conf

# Testar configuração final
echo "🧪 Testando configuração final..."
sudo nginx -t

# Recarregar nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

# Configurar renovação automática
echo "🔄 Configurando renovação automática..."
sudo crontab -l > mycron 2>/dev/null || echo "" > mycron
echo "0 12 * * * /usr/bin/certbot renew --quiet --reload nginx" >> mycron
sudo crontab mycron
rm mycron

# Testar certificados
echo "🧪 Testando certificados SSL..."
echo "Testando $PROD_DOMAIN..."
curl -I https://www.gunno.com.br || echo "⚠️  Certificado de produção pode não estar funcionando ainda"

echo "Testando $DEMO_DOMAIN..."
curl -I https://demonstracao.gunno.com.br || echo "⚠️  Certificado de demo pode não estar funcionando ainda"

echo "✅ SSL configurado com sucesso!"
echo ""
echo "🌐 URLs configuradas:"
echo "   🏢 Produção: https://www.gunno.com.br"
echo "   🧪 Demo: https://demonstracao.gunno.com.br"
echo ""
echo "🔒 Certificados SSL:"
echo "   📊 Produção: /etc/letsencrypt/live/www.gunno.com.br/"
echo "   🎯 Demo: /etc/letsencrypt/live/demonstracao.gunno.com.br/"
echo ""
echo "🔄 Renovação automática configurada para executar diariamente às 12h"
