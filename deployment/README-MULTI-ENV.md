# 🎯 Gunno OKR - Configuração Multi-Ambiente

## 📋 Visão Geral

Esta configuração suporta **dois ambientes isolados** na mesma VPS:

- **🏢 Produção**: `www.gunno.com.br` - Para clientes finais
- **🧪 Demonstração**: `demonstracao.gunno.com.br` - Para apresentações e testes

## 🏗️ Arquitetura

```
Internet
    │
    ├── www.gunno.com.br (SSL)
    │   ├── Nginx → Frontend Vue.js (Produção)
    │   └── /api/* → API Node.js:3001 (2 instâncias)
    │       └── MySQL: track_okr_production + Redis DB:0
    │
    └── demonstracao.gunno.com.br (SSL)
        ├── Nginx → Frontend Vue.js (Demo)
        └── /api/* → API Node.js:3002 (1 instância)
            └── MySQL: track_okr_demo + Redis DB:1
```

## 🚀 Instalação Completa

### 1. Pré-requisitos

- VPS com Ubuntu 20.04+
- 8GB RAM, 2 vCPUs, 100GB SSD
- Domínio configurado (`gunno.com.br`)
- Subdomínio configurado (`demonstracao.gunno.com.br`)

### 2. DNS Configuration

Configure os seguintes registros DNS:

```
A    gunno.com.br                → IP_DA_VPS
A    www.gunno.com.br           → IP_DA_VPS
A    demonstracao.gunno.com.br  → IP_DA_VPS
```

### 3. Deploy Automático

```bash
# 1. Conectar na VPS
ssh root@SEU_IP_VPS

# 2. Clonar repositório
git clone https://github.com/marcosvictorsb/track-okr-api.git
cd track-okr-api/deployment

# 3. Configurar permissões
chmod +x *.sh

# 4. Deploy completo (20-30 minutos)
sudo ./deploy-complete-multi.sh
```

### 4. Configuração Manual Pós-Deploy

#### 4.1 Configurar Variáveis de Ambiente

```bash
# Produção
sudo nano /opt/trackokr/production/api/.env

# Demo
sudo nano /opt/trackokr/demo/api/.env
```

#### 4.2 Configurar Repositórios do Frontend (opcional)

```bash
# Definir variáveis antes do deploy
export FRONTEND_PROD_REPO="https://github.com/seu-usuario/frontend-prod.git"
export FRONTEND_DEMO_REPO="https://github.com/seu-usuario/frontend-demo.git"

# Re-executar deploy dos frontends
sudo ./deploy-complete-multi.sh
```

## 📊 Características de Cada Ambiente

### 🏢 Produção (`www.gunno.com.br`)

- **Porta API**: 3001
- **Instâncias PM2**: 2 (cluster mode)
- **Banco**: `track_okr_production`
- **Redis DB**: 0
- **Rate Limiting**: Restritivo
- **Logs**: Nível INFO
- **Cache**: Longo (assets 1 ano)
- **Backup**: Diário às 2h
- **SSL**: Certificado dedicado

### 🧪 Demo (`demonstracao.gunno.com.br`)

- **Porta API**: 3002
- **Instâncias PM2**: 1
- **Banco**: `track_okr_demo`
- **Redis DB**: 1
- **Rate Limiting**: Permissivo
- **Logs**: Nível DEBUG
- **Cache**: Curto (assets 1 dia)
- **Reset de Dados**: Diário às 3h
- **SSL**: Certificado dedicado
- **Usuário Demo**: `demo@gunno.com.br / Demo123!`

## 🔧 Comandos de Gerenciamento

### Status e Monitoramento

```bash
# Health check completo
sudo /opt/trackokr/scripts/health-check-multi.sh

# Status das aplicações
sudo -u trackokr pm2 status

# Monitoramento em tempo real
sudo -u trackokr pm2 monit

# Logs em tempo real
sudo -u trackokr pm2 logs track-okr-production
sudo -u trackokr pm2 logs track-okr-demo
```

### Deploy e Restart

```bash
# Deploy apenas produção
sudo ./deploy-production.sh

# Deploy apenas demo
sudo ./deploy-demo.sh

# Restart aplicações
sudo -u trackokr pm2 restart track-okr-production
sudo -u trackokr pm2 restart track-okr-demo

# Restart Nginx
sudo systemctl restart nginx
```

### Backup e Manutenção

```bash
# Backup manual
sudo /opt/trackokr/scripts/backup-all.sh

# Reset manual dos dados de demo
sudo /opt/trackokr/scripts/reset-demo-data.sh

# Ver backups
ls -la /opt/trackokr/backups/
```

## 🔒 Segurança

### SSL/TLS

- Certificados Let's Encrypt automatizados
- Renovação automática configurada
- HSTS habilitado
- Redirecionamento HTTP → HTTPS

### Rate Limiting

- **Produção**: 5 req/min para auth, 100 req/min geral
- **Demo**: 10 req/min para auth, 300 req/min geral
- Proteção contra DDoS básica

### Firewall

```bash
# Portas abertas
22/tcp   (SSH)
80/tcp   (HTTP → HTTPS redirect)
443/tcp  (HTTPS)

# Todas outras portas bloqueadas
```

### Isolamento

- Bancos de dados separados
- Usuários de banco separados
- Redis databases separadas
- Logs separados
- Processos PM2 separados

## 📈 Performance e Recursos

### Distribuição de Recursos (8GB RAM)

```
MySQL:           4GB (buffer pool)
Redis:           1GB (cache)
API Produção:    1GB (2x 512MB)
API Demo:        256MB (1x 256MB)
Sistema:         ~2GB (OS, Nginx, etc.)
```

### Benchmarks Esperados

- **API Produção**: ~800-1000 req/s
- **API Demo**: ~300-500 req/s
- **Frontend**: Servido estaticamente (muito rápido)
- **Latência**: < 100ms local, < 200ms nacional

## 🚨 Troubleshooting

### API não inicia

```bash
# Verificar logs
sudo -u trackokr pm2 logs track-okr-production --lines 50

# Verificar porta em uso
sudo netstat -tlnp | grep :3001

# Restart forçado
sudo -u trackokr pm2 delete track-okr-production
sudo -u trackokr pm2 start ecosystem.production.json
```

### SSL não funciona

```bash
# Verificar certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew --nginx

# Testar configuração nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Banco de dados

```bash
# Verificar status MySQL
sudo systemctl status mysql

# Conectar nos bancos
mysql -u trackokr_prod -p track_okr_production
mysql -u trackokr_demo -p track_okr_demo

# Ver logs MySQL
sudo tail -f /var/log/mysql/error.log
```

### Demo não reseta

```bash
# Verificar cron
sudo -u trackokr crontab -l

# Executar reset manual
sudo -u trackokr /opt/trackokr/scripts/reset-demo-data.sh

# Ver logs do reset
tail -f /opt/trackokr/demo/logs/demo-reset.log
```

## 📞 Manutenção

### Atualizações

```bash
# Atualizar código
cd /opt/trackokr/production/api && git pull
cd /opt/trackokr/demo/api && git pull

# Rebuild e restart
sudo ./deploy-production.sh
sudo ./deploy-demo.sh
```

### Monitoramento de Logs

```bash
# Tail todos os logs importantes
sudo tail -f /opt/trackokr/*/logs/*.log

# Verificar erros recentes
sudo grep -r "ERROR" /opt/trackokr/*/logs/ | tail -20
```

### Limpeza de Espaço

```bash
# Limpar logs antigos
sudo find /opt/trackokr/*/logs/ -name "*.log" -mtime +30 -delete

# Limpar backups antigos
sudo find /opt/trackokr/backups/ -mtime +30 -delete

# Limpar cache npm
sudo npm cache clean --force
```

---

## 🎯 URLs de Acesso

- **🏢 Produção**: https://www.gunno.com.br
- **🧪 Demo**: https://demonstracao.gunno.com.br
- **📊 API Prod Health**: https://www.gunno.com.br/health
- **🧪 API Demo Health**: https://demonstracao.gunno.com.br/health

---

**✨ Configuração otimizada para VPS de 8GB - Suporte para produção e demonstração simultâneas**
