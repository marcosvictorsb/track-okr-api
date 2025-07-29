#!/bin/bash

# Script de verificação de saúde do sistema Track OKR

echo "🏥 Verificação de Saúde do Sistema Track OKR"
echo "=============================================="

# Verificar serviços
echo ""
echo "📋 Status dos Serviços:"
echo "----------------------"

# Nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: Rodando"
else
    echo "❌ Nginx: Parado"
fi

# MySQL
if systemctl is-active --quiet mysql; then
    echo "✅ MySQL: Rodando"
else
    echo "❌ MySQL: Parado"
fi

# Redis
if systemctl is-active --quiet redis-server; then
    echo "✅ Redis: Rodando"
else
    echo "❌ Redis: Parado"
fi

# PM2 e API
if sudo -u trackokr pm2 list | grep -q "track-okr-api.*online"; then
    echo "✅ API: Rodando"
    API_COUNT=$(sudo -u trackokr pm2 list | grep "track-okr-api.*online" | wc -l)
    echo "   📊 Instâncias ativas: $API_COUNT"
else
    echo "❌ API: Não está rodando"
fi

# Recursos do sistema
echo ""
echo "📊 Recursos do Sistema:"
echo "----------------------"

# CPU
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
echo "🖥️  CPU Usage: ${CPU_USAGE}%"

# Memory
MEMORY_INFO=$(free -h | grep Mem)
MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
MEMORY_PERCENT=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
echo "🧠 Memory: ${MEMORY_USED}/${MEMORY_TOTAL} (${MEMORY_PERCENT}%)"

# Disk
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3, $2, $5}')
echo "💾 Disk: $DISK_USAGE"

# Load Average
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')
echo "⚖️  Load Average:$LOAD_AVG"

# Testes de conectividade
echo ""
echo "🌐 Testes de Conectividade:"
echo "---------------------------"

# API Health
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health 2>/dev/null || echo "FAIL")
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API Health Check: OK"
else
    echo "❌ API Health Check: FAIL (Status: $API_STATUS)"
fi

# MySQL Connection
if mysql -u trackokr_user -p${DB_PASSWORD:-test} -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL Connection: OK"
else
    echo "❌ MySQL Connection: FAIL"
fi

# Redis Connection
if redis-cli ping >/dev/null 2>&1; then
    echo "✅ Redis Connection: OK"
else
    echo "❌ Redis Connection: FAIL"
fi

# SSL Certificate
if [ -f "/etc/letsencrypt/live/seu-dominio.com/fullchain.pem" ]; then
    CERT_EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/seu-dominio.com/fullchain.pem | cut -d= -f2)
    echo "🔒 SSL Certificate: Válido até $CERT_EXPIRY"
else
    echo "⚠️  SSL Certificate: Não encontrado"
fi

# Logs recentes
echo ""
echo "📝 Logs Recentes (últimas 5 linhas):"
echo "------------------------------------"

if [ -f "/opt/trackokr/logs/system-monitor.log" ]; then
    echo "📊 System Monitor:"
    tail -5 /opt/trackokr/logs/system-monitor.log
fi

if [ -f "/opt/trackokr/logs/api-error.log" ]; then
    echo ""
    echo "🚨 API Errors (se houver):"
    tail -5 /opt/trackokr/logs/api-error.log | grep ERROR || echo "   Nenhum erro recente"
fi

# Resumo
echo ""
echo "📋 Resumo:"
echo "----------"

ISSUES=0

# Verificar issues
if ! systemctl is-active --quiet nginx; then ((ISSUES++)); fi
if ! systemctl is-active --quiet mysql; then ((ISSUES++)); fi
if ! systemctl is-active --quiet redis-server; then ((ISSUES++)); fi
if ! sudo -u trackokr pm2 list | grep -q "track-okr-api.*online"; then ((ISSUES++)); fi
if [ "$API_STATUS" != "200" ]; then ((ISSUES++)); fi

# CPU/Memory warnings
if (( $(echo "$CPU_USAGE > 80" | bc -l 2>/dev/null || echo 0) )); then
    echo "⚠️  CPU usage alto: ${CPU_USAGE}%"
    ((ISSUES++))
fi

if (( $(echo "$MEMORY_PERCENT > 80" | bc -l 2>/dev/null || echo 0) )); then
    echo "⚠️  Memory usage alto: ${MEMORY_PERCENT}%"
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo "✅ Sistema funcionando perfeitamente!"
    echo "🚀 Tudo operacional - $API_COUNT instâncias da API rodando"
else
    echo "⚠️  $ISSUES problema(s) detectado(s)"
    echo "🔧 Verifique os serviços marcados com ❌"
fi

echo ""
echo "⏰ Verificação realizada em: $(date)"
echo "📊 Uptime do sistema: $(uptime -p)"
