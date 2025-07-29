# 🚀 Guia PM2 - Track OKR API

## 📦 Pré-requisitos

Certifique-se de ter o PM2 instalado:

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Verificar se está instalado
pm2 --version
```

## 🛠️ Configurações Disponíveis

### 1. **Desenvolvimento Local**

- **Arquivo**: `deployment/ecosystem.config.json`
- **Uso**: Para desenvolvimento e testes locais
- **Instâncias**: 1 (modo fork)
- **Porta padrão**: 3000

### 2. **Produção**

- **Arquivo**: `deployment/ecosystem.production.json`
- **Uso**: Ambiente de produção
- **Instâncias**: 2 (modo cluster)
- **Porta padrão**: 3001

### 3. **Demo**

- **Arquivo**: `deployment/ecosystem.demo.json`
- **Uso**: Ambiente de demonstração
- **Instâncias**: 1 (modo cluster)
- **Porta padrão**: 3002

## 🚀 Como Usar

### **Método 1: Scripts NPM (Recomendado)**

```bash
# 1. Fazer build e iniciar em desenvolvimento
npm run pm2:start

# 2. Fazer build e iniciar em produção
npm run pm2:start:prod

# 3. Fazer build e iniciar em demo
npm run pm2:start:demo

# Comandos de controle
npm run pm2:stop      # Parar a aplicação
npm run pm2:restart   # Reiniciar a aplicação
npm run pm2:reload    # Reload sem downtime
npm run pm2:delete    # Remover a aplicação do PM2
npm run pm2:logs      # Ver logs em tempo real
npm run pm2:status    # Ver status de todas as aplicações
```

### **Método 2: Comandos PM2 Diretos**

```bash
# 1. Fazer build primeiro
npm run build

# 2. Iniciar com PM2
pm2 start deployment/ecosystem.config.json         # Desenvolvimento
pm2 start deployment/ecosystem.production.json     # Produção
pm2 start deployment/ecosystem.demo.json           # Demo

# 3. Controlar a aplicação
pm2 stop track-okr-api
pm2 restart track-okr-api
pm2 reload track-okr-api
pm2 delete track-okr-api
pm2 logs track-okr-api
pm2 status
```

## 📊 Monitoramento

### **Ver Logs**

```bash
# Logs em tempo real
pm2 logs track-okr-api

# Logs específicos
pm2 logs track-okr-api --lines 100

# Logs salvos em arquivos (conforme configuração)
tail -f logs/api-combined.log
tail -f logs/api-error.log
tail -f logs/api-out.log
```

### **Status e Informações**

```bash
# Status de todas as aplicações
pm2 status

# Informações detalhadas
pm2 show track-okr-api

# Monitoramento em tempo real
pm2 monit
```

## 🔧 Configurações Importantes

### **Module Aliases**

As configurações do PM2 já incluem o suporte ao `module-alias`:

- `"node_args": "-r module-alias/register"`

### **Variáveis de Ambiente**

Configure suas variáveis de ambiente nos arquivos:

- `.env` (desenvolvimento)
- `deployment/.env.production` (produção)

### **Logs**

Os logs são salvos em:

- `logs/api-error.log` (erros)
- `logs/api-out.log` (stdout)
- `logs/api-combined.log` (combinado)

## 🔄 Fluxo de Deploy

### **Desenvolvimento Local**

```bash
# 1. Fazer alterações no código
# 2. Testar
npm test

# 3. Build e deploy
npm run pm2:start
```

### **Produção**

```bash
# 1. Fazer alterações no código
# 2. Testar localmente
npm test

# 3. Build
npm run build

# 4. Deploy em produção
npm run pm2:start:prod

# 5. Verificar se está funcionando
npm run pm2:status
npm run pm2:logs
```

## 🛡️ Comandos Úteis

```bash
# Salvar configuração atual do PM2
pm2 save

# Configurar PM2 para iniciar automaticamente no boot
pm2 startup

# Limpar logs
pm2 flush

# Atualizar PM2
npm install -g pm2@latest
pm2 update
```

## 🚨 Troubleshooting

### **Problema: Aplicação não inicia**

```bash
# 1. Verificar se o build foi feito
ls -la dist/

# 2. Verificar logs de erro
pm2 logs track-okr-api --err

# 3. Verificar se a porta está ocupada
lsof -i :3000
```

### **Problema: Module aliases não funcionam**

- Verifique se `module-alias` está instalado
- Verifique se `node_args` está configurado no ecosystem

### **Problema: Muitos restarts**

```bash
# Verificar logs para identificar o erro
pm2 logs track-okr-api

# Ajustar configurações de restart se necessário
# min_uptime, max_restarts, restart_delay
```

---

**✅ Tudo configurado!** Agora você pode usar o PM2 para gerenciar sua aplicação Track OKR API!
