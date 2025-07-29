#!/bin/bash

# Script de configuração multi-ambiente para Track OKR
# Produção: www.gunno.com.br
# Demonstração: demonstracao.gunno.com.br

echo "🚀 Configurando VPS para ambientes de Produção e Demonstração..."

# Criar estrutura de diretórios para ambos ambientes
echo "📁 Criando estrutura de diretórios..."
sudo mkdir -p /opt/trackokr/{production,demo}/{api,frontend,logs,data}
sudo mkdir -p /opt/trackokr/{backups,ssl,scripts}

# Estrutura final:
# /opt/trackokr/
# ├── production/          # Ambiente de produção (www.gunno.com.br)
# │   ├── api/            # API de produção
# │   ├── frontend/       # Frontend de produção
# │   ├── logs/           # Logs de produção
# │   └── data/           # Dados específicos
# ├── demo/               # Ambiente de demonstração (demonstracao.gunno.com.br)
# │   ├── api/            # API de demo
# │   ├── frontend/       # Frontend de demo
# │   ├── logs/           # Logs de demo
# │   └── data/           # Dados de demo
# ├── backups/            # Backups de ambos ambientes
# ├── ssl/                # Certificados SSL
# └── scripts/            # Scripts de automação

# Configurar permissões
sudo chown -R trackokr:trackokr /opt/trackokr

# Instalar Docker e Docker Compose (para isolamento melhor)
echo "🐳 Instalando Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker trackokr

echo "🔧 Instalando Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Criar bancos separados para cada ambiente
echo "🗄️  Configurando bancos de dados separados..."
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS track_okr_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS track_okr_demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'trackokr_prod'@'localhost' IDENTIFIED BY '$(openssl rand -base64 32)';
CREATE USER IF NOT EXISTS 'trackokr_demo'@'localhost' IDENTIFIED BY '$(openssl rand -base64 32)';

GRANT ALL PRIVILEGES ON track_okr_production.* TO 'trackokr_prod'@'localhost';
GRANT ALL PRIVILEGES ON track_okr_demo.* TO 'trackokr_demo'@'localhost';
FLUSH PRIVILEGES;
"

# Configurar Redis com databases separados
echo "🔴 Configurando Redis para ambientes separados..."
sudo tee -a /etc/redis/redis.conf > /dev/null <<EOF

# Configurações para ambientes separados
# Produção usará DB 0 (padrão)
# Demo usará DB 1
databases 16
EOF

sudo systemctl restart redis-server

echo "✅ Configuração multi-ambiente concluída!"
echo ""
echo "📋 Estrutura criada:"
echo "   🏢 Produção: /opt/trackokr/production/"
echo "   🧪 Demo: /opt/trackokr/demo/"
echo "   💾 Backups: /opt/trackokr/backups/"
echo ""
echo "🌐 Domínios configurados:"
echo "   📊 Produção: www.gunno.com.br"
echo "   🎯 Demo: demonstracao.gunno.com.br"
