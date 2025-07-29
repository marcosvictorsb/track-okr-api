# 🚀 Guia de Deploy - Track OKR API + Frontend

Este guia fornece instruções completas para configurar sua VPS e fazer deploy da aplicação Track OKR com API Node.js/TypeScript e frontend Vue.js.

## 📋 Especificações da VPS

- **CPU**: 2 núcleos vCPU
- **RAM**: 8 GB
- **Armazenamento**: 100 GB NVMe SSD
- **Largura de banda**: 8 TB
- **SO**: Linux (Ubuntu 20.04+ recomendado)

## 🏗️ Arquitetura de Deploy

```
Internet → Nginx (Proxy Reverso + SSL) → API Node.js (PM2 Cluster)
                                      ↓
                                   Frontend Vue.js (SPA)
                                      ↓
                                   MySQL + Redis
```

## 🚀 Instalação Completa

### 1. Configuração Inicial da VPS

```bash
# 1. Conectar na VPS
ssh root@seu-ip-vps

# 2. Executar configuração inicial
wget https://raw.githubusercontent.com/seu-repo/track-okr-api/main/deployment/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 2. Deploy Completo

```bash
# 1. Clonar repositório de deployment
git clone https://github.com/seu-repo/track-okr-api.git
cd track-okr-api/deployment

# 2. Tornar scripts executáveis
chmod +x *.sh

# 3. Executar deploy completo
sudo ./deploy-complete.sh
```

### 3. Configuração Manual Adicional

#### 3.1 Configurar DNS

- Aponte seu domínio para o IP da VPS
- Configure registros A para `@` e `www`

#### 3.2 Configurar Variáveis de Ambiente

```bash
# Editar arquivo .env da API
sudo nano /opt/trackokr/api/.env

# Configurar com os valores do banco gerados
# Adicionar chaves JWT, email, etc.
```

#### 3.3 Executar Migrações

```bash
cd /opt/trackokr/api
sudo -u trackokr npm run migration
```

## 📊 Monitoramento e Manutenção

### Comandos Úteis

```bash
# Status da aplicação
sudo -u trackokr pm2 status
sudo -u trackokr pm2 monit

# Logs
sudo -u trackokr pm2 logs
tail -f /opt/trackokr/logs/system-monitor.log

# Status dos serviços
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status redis-server

# Reiniciar serviços
sudo -u trackokr pm2 restart all
sudo systemctl restart nginx
```

### Backup e Restore

```bash
# Backup manual
sudo /opt/trackokr/backup.sh

# Restore do banco
mysql -u trackokr_user -p track_okr < backup.sql
```

## 🔧 Otimizações para 8GB RAM

### MySQL (4GB alocados)

- `innodb_buffer_pool_size = 4G`
- `query_cache_size = 256M`
- Configurado para alta performance

### Redis (1GB alocado)

- `maxmemory 1gb`
- Policy: `allkeys-lru`
- Configurado para cache eficiente

### PM2 (Cluster mode)

- 2 instâncias da API
- Auto-restart configurado
- Max memory: 512MB por instância

### Nginx

- Gzip habilitado
- Cache de assets estáticos
- Rate limiting configurado

## 🔒 Segurança

### Firewall

- Portas abertas: 22 (SSH), 80 (HTTP), 443 (HTTPS)
- Todas as outras portas bloqueadas

### SSL/TLS

- Let's Encrypt configurado
- Auto-renovação agendada
- Security headers configurados

### Rate Limiting

- API protegida contra abuse
- Endpoints de auth com limite específico

## 📈 Performance

### Benchmarks Esperados

- **API**: ~1000 req/s com 2 instâncias
- **Frontend**: Servido estaticamente pelo Nginx
- **Banco**: Suporta ~200 conexões simultâneas
- **Cache**: Redis para sessões e cache de queries

### Monitoramento

- Logs automáticos de sistema
- Alertas para CPU/RAM > 80%
- Health checks configurados

## 🚨 Troubleshooting

### API não inicia

```bash
# Verificar logs
sudo -u trackokr pm2 logs

# Verificar configuração
sudo -u trackokr pm2 describe track-okr-api

# Reiniciar
sudo -u trackokr pm2 restart track-okr-api
```

### Banco de dados

```bash
# Verificar status
sudo systemctl status mysql

# Logs do MySQL
sudo tail -f /var/log/mysql/error.log

# Testar conexão
mysql -u trackokr_user -p -h localhost track_okr
```

### Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Logs
sudo tail -f /var/log/nginx/error.log
```

## 📞 Suporte

Para problemas específicos:

1. Verificar logs do sistema
2. Consultar documentação da API
3. Abrir issue no repositório

---

**Desenvolvido para VPS com 8GB RAM - Otimizado para alta performance**
