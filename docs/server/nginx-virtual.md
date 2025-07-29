# Configuração de Virtual Hosts - Nginx (Gunno)

## Domínios Configurados

### Produção:

- **gunno.com.br**
- **www.gunno.com.br**
- **gunno.io**
- **www.gunno.io**

### Testing/Demonstração:

- **demostracao.gunno.com.br**
- **demostracao.gunno.io**

## Diretórios dos Projetos:

- **Produção**: `/var/www/production`
- **Testing**: `/var/www/testing`

## Configuração DNS Necessária

Você precisa configurar os seguintes registros DNS nos seus provedores:

### Para gunno.com.br:

```
gunno.com.br                A    SEU_IP_DO_SERVIDOR
www.gunno.com.br           A    SEU_IP_DO_SERVIDOR
demostracao.gunno.com.br   A    SEU_IP_DO_SERVIDOR
```

### Para gunno.io:

```
gunno.io                   A    SEU_IP_DO_SERVIDOR
www.gunno.io              A    SEU_IP_DO_SERVIDOR
demostracao.gunno.io      A    SEU_IP_DO_SERVIDOR
```

## Próximos Passos

### 1. Deploy dos Projetos

```bash
# Para produção (gunno.com.br e gunno.io)
sudo cp -r /caminho/do/projeto/producao/* /var/www/production/
sudo chown -R www-data:www-data /var/www/production/

# Para testing/demonstração
sudo cp -r /caminho/do/projeto/testing/* /var/www/testing/
sudo chown -R www-data:www-data /var/www/testing/
```

### 2. Configurar SSL com Let's Encrypt

```bash
# Instalar certbot (se não estiver instalado)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obter certificados para produção
sudo certbot --nginx -d gunno.com.br -d www.gunno.com.br -d gunno.io -d www.gunno.io

# Obter certificados para testing
sudo certbot --nginx -d demostracao.gunno.com.br -d demostracao.gunno.io
```

### 3. Teste Local (Opcional)

Para testar antes de configurar o DNS, adicione ao `/etc/hosts`:

```
127.0.0.1 gunno.com.br
127.0.0.1 www.gunno.com.br
127.0.0.1 gunno.io
127.0.0.1 www.gunno.io
127.0.0.1 demostracao.gunno.com.br
127.0.0.1 demostracao.gunno.io
```

## Comandos Úteis

```bash
# Verificar configuração
sudo nginx -t

# Recarregar nginx
sudo systemctl reload nginx

# Ver logs
sudo tail -f /var/log/nginx/production_access.log
sudo tail -f /var/log/nginx/testing_access.log
sudo tail -f /var/log/nginx/production_error.log
sudo tail -f /var/log/nginx/testing_error.log

# Status do nginx
sudo systemctl status nginx
```

## Estrutura Final

```
Domínios de Produção:
├── gunno.com.br ──────────┐
├── www.gunno.com.br ──────┤
├── gunno.io ──────────────┤──→ /var/www/production/
└── www.gunno.io ──────────┘

Domínios de Testing:
├── demostracao.gunno.com.br ──┐
└── demostracao.gunno.io ──────┘──→ /var/www/testing/
```

## Configurações de Ambiente

### Produção (gunno.com.br / gunno.io):

✅ Headers de segurança habilitados  
✅ Cache otimizado para performance  
✅ Logs separados  
✅ Preparado para SSL  
✅ Bloqueio de arquivos sensíveis

### Testing/Demonstração:

✅ Cache desabilitado (facilita desenvolvimento)  
✅ Configuração menos restritiva  
✅ Logs separados  
✅ Preparado para debugging  
✅ Suporte para proxy (APIs)

---

**Status**: ✅ Configuração aplicada e nginx recarregado com sucesso!
