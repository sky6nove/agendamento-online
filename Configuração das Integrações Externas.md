# Configuração das Integrações Externas

## 1. Integração com n8n para Notificações WhatsApp

### Pré-requisitos
- n8n instalado e rodando (localhost:5678)
- Evolution API configurada
- Webhook configurado no n8n

### Configuração do n8n

1. **Criar Workflow no n8n:**
   - Acesse http://localhost:5678
   - Crie um novo workflow
   - Adicione um nó "Webhook" como trigger

2. **Configurar Webhook:**
   - URL: `http://localhost:5678/webhook/whatsapp-notification`
   - Método: POST
   - Resposta: JSON

3. **Adicionar nó Evolution API:**
   - Conecte ao webhook
   - Configure para enviar mensagens via WhatsApp
   - Use os dados recebidos do webhook

### Exemplo de Workflow n8n:

```json
{
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-notification",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "url": "http://localhost:8080/message/sendText/instance1",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "apikey",
              "value": "={{$credentials.evolutionApiKey}}"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "number",
              "value": "={{$node.Webhook.json.phone}}"
            },
            {
              "name": "text",
              "value": "={{$node.Webhook.json.message}}"
            }
          ]
        }
      },
      "name": "Evolution API",
      "type": "n8n-nodes-base.httpRequest"
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Evolution API",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 2. Configuração da Evolution API

### Instalação via Docker

```bash
# Clonar repositório
git clone https://github.com/EvolutionAPI/evolution-api.git
cd evolution-api

# Configurar variáveis de ambiente
cp .env.example .env

# Editar .env com suas configurações
nano .env

# Iniciar com Docker
docker-compose up -d
```

### Configurações importantes no .env:

```env
# Servidor
SERVER_PORT=8080
SERVER_URL=http://localhost:8080

# Banco de dados
DATABASE_ENABLED=true
DATABASE_CONNECTION_URI=mongodb://localhost:27017/evolution

# WhatsApp
QRCODE_LIMIT=30
AUTHENTICATION_TYPE=apikey
AUTHENTICATION_API_KEY=your-evolution-api-key

# Webhook
WEBHOOK_GLOBAL_ENABLED=true
WEBHOOK_GLOBAL_URL=http://localhost:5678/webhook/whatsapp-status
```

### Criar Instância WhatsApp:

```bash
curl -X POST http://localhost:8080/instance/create \
  -H "Content-Type: application/json" \
  -H "apikey: your-evolution-api-key" \
  -d '{
    "instanceName": "instance1",
    "qrcode": true,
    "webhook": {
      "url": "http://localhost:5678/webhook/whatsapp-status",
      "events": ["messages", "connection"]
    }
  }'
```

## 3. Configuração no Sistema de Agendamento

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto backend:

```env
# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-notification

# Evolution API Configuration
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-evolution-api-key
EVOLUTION_INSTANCE=instance1

# Notification Settings
NOTIFICATIONS_ENABLED=true
SEND_CONFIRMATION=true
SEND_REMINDERS=true
REMINDER_HOURS_BEFORE=24
```

### Atualizar notification_service.py

```python
import os
from dotenv import load_dotenv

load_dotenv()

class NotificationService:
    def __init__(self):
        self.n8n_webhook_url = os.getenv('N8N_WEBHOOK_URL', 'http://localhost:5678/webhook/whatsapp-notification')
        self.evolution_api_url = os.getenv('EVOLUTION_API_URL', 'http://localhost:8080')
        self.evolution_api_key = os.getenv('EVOLUTION_API_KEY', 'your-evolution-api-key')
        self.evolution_instance = os.getenv('EVOLUTION_INSTANCE', 'instance1')
        self.notifications_enabled = os.getenv('NOTIFICATIONS_ENABLED', 'true').lower() == 'true'
```

## 4. Testando as Integrações

### Teste Manual via cURL:

```bash
# Testar webhook n8n
curl -X POST http://localhost:5678/webhook/whatsapp-notification \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste de notificação",
    "appointment_id": 1,
    "timestamp": "2024-01-01T10:00:00Z"
  }'

# Testar Evolution API diretamente
curl -X POST http://localhost:8080/message/sendText/instance1 \
  -H "Content-Type: application/json" \
  -H "apikey: your-evolution-api-key" \
  -d '{
    "number": "5511999999999",
    "text": "Teste direto Evolution API"
  }'
```

## 5. Monitoramento e Logs

### Logs do n8n:
- Acesse http://localhost:5678
- Vá em "Executions" para ver histórico

### Logs da Evolution API:
```bash
docker logs evolution-api
```

### Logs do Sistema:
- Verifique os logs do Flask para erros de notificação
- Implemente logging adequado no notification_service.py

## 6. Troubleshooting

### Problemas Comuns:

1. **Webhook não recebe dados:**
   - Verificar se n8n está rodando
   - Verificar URL do webhook
   - Verificar firewall/proxy

2. **Evolution API não envia mensagens:**
   - Verificar se instância está conectada
   - Verificar QR Code se necessário
   - Verificar API key

3. **Mensagens não chegam:**
   - Verificar formato do número de telefone
   - Verificar se WhatsApp está ativo
   - Verificar limites de rate da API

### Comandos Úteis:

```bash
# Verificar status da instância
curl -X GET http://localhost:8080/instance/connectionState/instance1 \
  -H "apikey: your-evolution-api-key"

# Gerar novo QR Code
curl -X GET http://localhost:8080/instance/connect/instance1 \
  -H "apikey: your-evolution-api-key"

# Listar instâncias
curl -X GET http://localhost:8080/instance/fetchInstances \
  -H "apikey: your-evolution-api-key"
```

