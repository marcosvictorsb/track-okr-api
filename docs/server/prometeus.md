# 🚀 Guia de Acesso - Grafana e Prometheus

## 📊 URLs de Acesso

### **Grafana (Painel de Dashboards)**

- **Domínios**:
  - `http://grafana.gunno.com.br`
  - `http://grafana.gunno.io`
- **Porta direta**: `http://SEU_IP:3000`
- **Credenciais padrão**:
  - **Usuário**: `admin`
  - **Senha**: `admin` (você será solicitado a alterar no primeiro login)

### **Prometheus (Coleta de Métricas)**

- **Domínios**:
  - `http://prometheus.gunno.com.br`
  - `http://prometheus.gunno.io`
- **Porta direta**: `http://SEU_IP:9090`

### **Node Exporter (Métricas do Sistema)**

- **Porta direta**: `http://SEU_IP:9100`
- **Endpoint de métricas**: `http://SEU_IP:9100/metrics`

## 🛠️ Status dos Serviços

```bash
# Verificar status
sudo systemctl status grafana-server
sudo systemctl status prometheus
sudo systemctl status prometheus-node-exporter

# Reiniciar serviços se necessário
sudo systemctl restart grafana-server
sudo systemctl restart prometheus
sudo systemctl restart prometheus-node-exporter
```

## 🌐 Configuração DNS Necessária

Adicione estes registros DNS aos seus domínios:

### Para gunno.com.br:

```
grafana.gunno.com.br      A    SEU_IP_DO_SERVIDOR
prometheus.gunno.com.br   A    SEU_IP_DO_SERVIDOR
```

### Para gunno.io:

```
grafana.gunno.io          A    SEU_IP_DO_SERVIDOR
prometheus.gunno.io       A    SEU_IP_DO_SERVIDOR
```

## 📝 Primeiros Passos

### 1. **Acessar o Grafana**

1. Abra `http://grafana.gunno.com.br` no navegador
2. Faça login com `admin/admin`
3. Altere a senha quando solicitado
4. Configure o Prometheus como fonte de dados

### 2. **Configurar Prometheus no Grafana**

1. No Grafana, vá em **Configuration > Data Sources**
2. Clique em **Add data source**
3. Selecione **Prometheus**
4. Configure a URL: `http://localhost:9090`
5. Clique em **Save & Test**

### 3. **Importar Dashboards**

Dashboards recomendados:

- **Node Exporter Full**: ID `1860`
- **Node Exporter for Prometheus Dashboard**: ID `11074`
- **MySQL Overview**: ID `7362`

## 🔧 Configurações Importantes

### Portas utilizadas:

- **Grafana**: `3000`
- **Prometheus**: `9090`
- **Node Exporter**: `9100`

### Arquivos de configuração:

- **Grafana**: `/etc/grafana/grafana.ini`
- **Prometheus**: `/etc/prometheus/prometheus.yml`
- **Nginx**: `/etc/nginx/sites-available/grafana` e `/etc/nginx/sites-available/prometheus`

### Logs:

- **Grafana**: `/var/log/grafana/grafana.log`
- **Prometheus**: `journalctl -u prometheus`
- **Node Exporter**: `journalctl -u prometheus-node-exporter`
- **Nginx**: `/var/log/nginx/grafana_access.log`, `/var/log/nginx/prometheus_access.log`

## 🔒 Segurança (Recomendações)

### Para Produção:

1. **Configure SSL/HTTPS** com Let's Encrypt
2. **Altere senhas padrão** do Grafana
3. **Configure autenticação** no Prometheus (se necessário)
4. **Limite acesso** por IP ou VPN
5. **Configure firewall** adequadamente

### Comandos SSL (Let's Encrypt):

```bash
sudo certbot --nginx -d grafana.gunno.com.br -d grafana.gunno.io
sudo certbot --nginx -d prometheus.gunno.com.br -d prometheus.gunno.io
```

## 📊 Métricas Disponíveis

### Sistema (Node Exporter):

- CPU, RAM, Disco
- Rede, Processes
- Filesystem, Load Average

### MySQL:

- Connections, Queries
- InnoDB, Performance
- Slow Queries

### Nginx:

- Requests, Response Times
- Active Connections
- Error Rates

## 🚨 Comandos Úteis

```bash
# Verificar se as portas estão abertas
sudo netstat -tlnp | grep -E ':(9090|3000|9100)'

# Testar conectividade
curl http://localhost:3000
curl http://localhost:9090
curl http://localhost:9100/metrics

# Ver logs em tempo real
sudo tail -f /var/log/nginx/grafana_access.log
sudo journalctl -fu grafana-server
sudo journalctl -fu prometheus
```

---

**Status**: ✅ Todos os serviços estão rodando e configurados!
**Próximo passo**: Configure o DNS e acesse via navegador!
