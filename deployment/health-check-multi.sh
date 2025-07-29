#!/bin/bash

# Health Check Multi-Ambiente para Gunno OKR

echo "🏥 Health Check - Gunno OKR Multi-Ambiente"
echo "=============================================="
echo "🏢 Produção: www.gunno.com.br"
echo "🧪 Demo: demonstracao.gunno.com.br"
echo ""

# Função para verificar status HTTP
check_http() {
    local url=$1
    local name=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "FAIL")
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$url" 2>/dev/null || echo "0")
    
    if [ "$status" = "200" ]; then
        echo "✅ $name: OK (${response_time}s)"
    else
        echo "❌ $name: FAIL (Status: $status)"
    fi
}

# Verificar serviços do sistema
echo "📋 Status dos Serviços Base:"
echo "----------------------------"

services=("nginx" "mysql" "redis-server")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: Rodando"
    else
        echo "❌ $service: Parado"
    fi
done

# Verificar aplicações PM2
echo ""
echo "📊 Status das Aplicações:"
echo "------------------------"

if sudo -u trackokr pm2 list | grep -q "track-okr-production.*online"; then
    prod_instances=$(sudo -u trackokr pm2 list | grep "track-okr-production.*online" | wc -l)
    echo "✅ API Produção: $prod_instances instância(s) online"
else
    echo "❌ API Produção: Não está rodando"
fi

if sudo -u trackokr pm2 list | grep -q "track-okr-demo.*online"; then
    demo_instances=$(sudo -u trackokr pm2 list | grep "track-okr-demo.*online" | wc -l)
    echo "✅ API Demo: $demo_instances instância(s) online"
else
    echo "❌ API Demo: Não está rodando"
fi

# Verificar conectividade HTTP/HTTPS
echo ""
echo "🌐 Testes de Conectividade:"
echo "---------------------------"

# Produção
echo "🏢 PRODUÇÃO:"
check_http "http://www.gunno.com.br" "HTTP Redirect"
check_http "https://www.gunno.com.br" "HTTPS Frontend"
check_http "https://www.gunno.com.br/health" "API Health"

echo ""
echo "🧪 DEMONSTRAÇÃO:"
check_http "http://demonstracao.gunno.com.br" "HTTP Redirect"
check_http "https://demonstracao.gunno.com.br" "HTTPS Frontend"
check_http "https://demonstracao.gunno.com.br/health" "API Health"

# Verificar bancos de dados
echo ""
echo "🗄️  Bancos de Dados:"
echo "-------------------"

# MySQL Produção
if mysql -u trackokr_prod -p${DB_PROD_PASSWORD:-test} -e "SELECT 1;" track_okr_production >/dev/null 2>&1; then
    prod_tables=$(mysql -u trackokr_prod -p${DB_PROD_PASSWORD:-test} -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'track_okr_production';" -s -N 2>/dev/null || echo "0")
    echo "✅ MySQL Produção: OK ($prod_tables tabelas)"
else
    echo "❌ MySQL Produção: FAIL"
fi

# MySQL Demo
if mysql -u trackokr_demo -p${DB_DEMO_PASSWORD:-test} -e "SELECT 1;" track_okr_demo >/dev/null 2>&1; then
    demo_tables=$(mysql -u trackokr_demo -p${DB_DEMO_PASSWORD:-test} -e "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'track_okr_demo';" -s -N 2>/dev/null || echo "0")
    echo "✅ MySQL Demo: OK ($demo_tables tabelas)"
else
    echo "❌ MySQL Demo: FAIL"
fi

# Redis
echo ""
echo "🔴 Cache Redis:"
echo "---------------"

redis_prod=$(redis-cli -n 0 ping 2>/dev/null || echo "FAIL")
redis_demo=$(redis-cli -n 1 ping 2>/dev/null || echo "FAIL")

if [ "$redis_prod" = "PONG" ]; then
    echo "✅ Redis Produção (DB 0): OK"
else
    echo "❌ Redis Produção (DB 0): FAIL"
fi

if [ "$redis_demo" = "PONG" ]; then
    echo "✅ Redis Demo (DB 1): OK"
else
    echo "❌ Redis Demo (DB 1): FAIL"
fi

# Verificar certificados SSL
echo ""
echo "🔒 Certificados SSL:"
echo "-------------------"

if [ -f "/etc/letsencrypt/live/www.gunno.com.br/fullchain.pem" ]; then
    prod_cert_expiry=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/www.gunno.com.br/fullchain.pem 2>/dev/null | cut -d= -f2 || echo "Erro ao ler")
    echo "✅ SSL Produção: Válido até $prod_cert_expiry"
else
    echo "❌ SSL Produção: Certificado não encontrado"
fi

if [ -f "/etc/letsencrypt/live/demonstracao.gunno.com.br/fullchain.pem" ]; then
    demo_cert_expiry=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/demonstracao.gunno.com.br/fullchain.pem 2>/dev/null | cut -d= -f2 || echo "Erro ao ler")
    echo "✅ SSL Demo: Válido até $demo_cert_expiry"
else
    echo "❌ SSL Demo: Certificado não encontrado"
fi

# Recursos do sistema
echo ""
echo "📊 Recursos do Sistema:"
echo "----------------------"

CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_INFO=$(free -h | grep Mem)
MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
MEMORY_PERCENT=$(free | grep Mem | awk '{printf("%.1f"), $3/$2 * 100.0}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3, $2, $5}')
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}')

echo "🖥️  CPU: ${CPU_USAGE}%"
echo "🧠 RAM: ${MEMORY_USED}/${MEMORY_TOTAL} (${MEMORY_PERCENT}%)"
echo "💾 Disk: $DISK_USAGE"
echo "⚖️  Load:$LOAD_AVG"

# Logs recentes de erro
echo ""
echo "📝 Logs Recentes de Erro:"
echo "-------------------------"

echo "🏢 Produção:"
if [ -f "/opt/trackokr/production/logs/api-error.log" ]; then
    error_count=$(tail -100 /opt/trackokr/production/logs/api-error.log 2>/dev/null | grep -i error | wc -l)
    if [ $error_count -gt 0 ]; then
        echo "   ⚠️  $error_count erro(s) nos últimos 100 logs"
        tail -3 /opt/trackokr/production/logs/api-error.log 2>/dev/null | grep -i error | head -2
    else
        echo "   ✅ Nenhum erro recente"
    fi
else
    echo "   📝 Log não encontrado"
fi

echo "🧪 Demo:"
if [ -f "/opt/trackokr/demo/logs/api-error.log" ]; then
    error_count=$(tail -100 /opt/trackokr/demo/logs/api-error.log 2>/dev/null | grep -i error | wc -l)
    if [ $error_count -gt 0 ]; then
        echo "   ⚠️  $error_count erro(s) nos últimos 100 logs"
        tail -3 /opt/trackokr/demo/logs/api-error.log 2>/dev/null | grep -i error | head -2
    else
        echo "   ✅ Nenhum erro recente"
    fi
else
    echo "   📝 Log não encontrado"
fi

# Resumo final
echo ""
echo "📋 Resumo Executivo:"
echo "-------------------"

issues=0

# Contar problemas
if ! systemctl is-active --quiet nginx; then ((issues++)); fi
if ! systemctl is-active --quiet mysql; then ((issues++)); fi
if ! systemctl is-active --quiet redis-server; then ((issues++)); fi
if ! sudo -u trackokr pm2 list | grep -q "track-okr-production.*online"; then ((issues++)); fi
if ! sudo -u trackokr pm2 list | grep -q "track-okr-demo.*online"; then ((issues++)); fi

# Avisos de recursos
if (( $(echo "$CPU_USAGE > 80" | bc -l 2>/dev/null || echo 0) )); then
    echo "⚠️  CPU alto: ${CPU_USAGE}%"
    ((issues++))
fi

if (( $(echo "$MEMORY_PERCENT > 85" | bc -l 2>/dev/null || echo 0) )); then
    echo "⚠️  Memória alta: ${MEMORY_PERCENT}%"
    ((issues++))
fi

if [ $issues -eq 0 ]; then
    echo "🎉 SISTEMA TOTALMENTE OPERACIONAL!"
    echo "   🏢 Produção funcionando perfeitamente"
    echo "   🧪 Demo funcionando perfeitamente"
    echo "   📊 Recursos do sistema normais"
else
    echo "⚠️  $issues problema(s) detectado(s)"
    echo "🔧 Revise os itens marcados com ❌"
fi

echo ""
echo "⏰ Verificação realizada em: $(date)"
echo "📊 Uptime do sistema: $(uptime -p)"
echo ""
echo "🔗 Links Úteis:"
echo "   🏢 https://www.gunno.com.br"
echo "   🧪 https://demonstracao.gunno.com.br"
echo "   📊 Monitoramento: sudo -u trackokr pm2 monit"
