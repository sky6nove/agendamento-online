# Documentação do Sistema de Agendamento Online

## 1. Introdução

Este documento descreve a arquitetura, funcionalidades e implementação do Sistema de Agendamento Online. O sistema foi desenvolvido para conectar profissionais e clientes, permitindo que profissionais gerenciem suas agendas e serviços, e que clientes agendem horários de forma simples e rápida, sem a necessidade de criar uma conta.

### 1.1. Funcionalidades Principais

- **Cadastro e Gerenciamento de Profissionais:** Profissionais podem se cadastrar, configurar seus perfis, serviços, horários de funcionamento e limites de atendimento.
- **Agendamento de Clientes:** Clientes podem agendar serviços fornecendo informações básicas (nome, telefone, etc.), sem a necessidade de criar uma conta.
- **Notificações via WhatsApp:** O sistema envia notificações automáticas de agendamento, lembretes e cancelamentos via WhatsApp, utilizando n8n e Evolution API.
- **Relatórios e Análises:** Profissionais têm acesso a relatórios detalhados sobre seus agendamentos, receita e performance dos serviços.
- **Diretório de Profissionais:** Um diretório público permite que clientes encontrem e agendem com profissionais que possuem agendas públicas.

## 2. Arquitetura do Sistema

O sistema é composto por um backend desenvolvido em Python com Flask e um frontend em React. A comunicação entre o backend e o frontend é feita através de uma API RESTful.

### 2.1. Tecnologias Utilizadas

- **Backend:**
  - **Framework:** Flask
  - **Linguagem:** Python 3.11
  - **Banco de Dados:** SQLite (para desenvolvimento) / PostgreSQL (recomendado para produção)
  - **ORM:** SQLAlchemy
  - **Notificações:** Integração com n8n e Evolution API

- **Frontend:**
  - **Framework:** React
  - **Linguagem:** JavaScript (JSX)
  - **Estilização:** Tailwind CSS e shadcn/ui
  - **Roteamento:** React Router
  - **Gráficos:** Recharts

### 2.2. Estrutura de Pastas

#### Backend (`agendamento-online`)

```
/agendamento-online
├── src
│   ├── models       # Modelos de dados (SQLAlchemy)
│   ├── routes       # Rotas da API (Blueprints Flask)
│   ├── services     # Lógica de negócios e integrações
│   ├── static       # Arquivos estáticos (se necessário)
│   ├── database     # Banco de dados SQLite
│   └── main.py      # Ponto de entrada da aplicação Flask
├── venv             # Ambiente virtual Python
├── requirements.txt # Dependências Python
└── INTEGRACOES.md   # Documentação das integrações
```

#### Frontend (`agendamento-frontend`)

```
/agendamento-frontend
├── public           # Arquivos públicos
├── src
│   ├── assets       # Imagens e outros assets
│   ├── components   # Componentes React reutilizáveis
│   ├── hooks        # Hooks React customizados
│   ├── lib          # Funções utilitárias
│   ├── pages        # Páginas da aplicação
│   ├── App.jsx      # Componente principal da aplicação
│   ├── main.jsx     # Ponto de entrada do React
│   └── ...
├── package.json     # Dependências e scripts Node.js
└── ...
```




## 3. Modelos de Dados

O sistema utiliza SQLAlchemy como ORM para gerenciar os dados. Os principais modelos são:

### 3.1. Professional (Profissional)

Representa um profissional que oferece serviços através da plataforma.

**Campos:**
- `id` (Integer, Primary Key): Identificador único do profissional
- `name` (String, 100): Nome completo do profissional
- `email` (String, 120, Unique): Email para login e contato
- `phone` (String, 20): Telefone para contato e notificações
- `password_hash` (String, 255): Hash da senha para autenticação
- `description` (Text): Descrição dos serviços oferecidos
- `address` (String, 255): Endereço do profissional
- `is_public` (Boolean): Define se a agenda é pública ou privada
- `created_at` (DateTime): Data de criação do registro

**Relacionamentos:**
- `services`: Lista de serviços oferecidos pelo profissional
- `schedules`: Horários de funcionamento configurados
- `appointments`: Agendamentos recebidos

### 3.2. Service (Serviço)

Representa um serviço oferecido por um profissional.

**Campos:**
- `id` (Integer, Primary Key): Identificador único do serviço
- `professional_id` (Integer, Foreign Key): Referência ao profissional
- `name` (String, 100): Nome do serviço
- `description` (Text): Descrição detalhada do serviço
- `duration_minutes` (Integer): Duração em minutos
- `price` (Float): Preço do serviço
- `is_active` (Boolean): Status ativo/inativo
- `requires_address` (Boolean): Se requer endereço do cliente
- `created_at` (DateTime): Data de criação

### 3.3. Schedule (Horário de Funcionamento)

Define os horários de funcionamento de um profissional por dia da semana.

**Campos:**
- `id` (Integer, Primary Key): Identificador único
- `professional_id` (Integer, Foreign Key): Referência ao profissional
- `day_of_week` (Integer): Dia da semana (0=Segunda, 6=Domingo)
- `start_time` (Time): Horário de início
- `end_time` (Time): Horário de fim
- `break_start` (Time): Início do intervalo (opcional)
- `break_end` (Time): Fim do intervalo (opcional)
- `max_appointments_per_slot` (Integer): Limite de agendamentos por horário
- `is_active` (Boolean): Status ativo/inativo
- `created_at` (DateTime): Data de criação

### 3.4. Appointment (Agendamento)

Representa um agendamento feito por um cliente.

**Campos:**
- `id` (Integer, Primary Key): Identificador único
- `professional_id` (Integer, Foreign Key): Referência ao profissional
- `service_id` (Integer, Foreign Key): Referência ao serviço
- `client_name` (String, 100): Nome do cliente
- `client_phone` (String, 20): Telefone do cliente
- `client_email` (String, 120): Email do cliente (opcional)
- `client_address` (String, 255): Endereço do cliente (se necessário)
- `appointment_date` (Date): Data do agendamento
- `appointment_time` (Time): Horário do agendamento
- `status` (String, 20): Status (agendado, confirmado, cancelado, concluido)
- `notes` (Text): Observações adicionais
- `notification_sent` (Boolean): Se a notificação foi enviada
- `reminder_sent` (Boolean): Se o lembrete foi enviado
- `created_at` (DateTime): Data de criação
- `updated_at` (DateTime): Data da última atualização

## 4. API Endpoints

A API RESTful do sistema oferece os seguintes endpoints:

### 4.1. Autenticação de Profissionais

#### POST `/api/professionals/register`
Cadastra um novo profissional.

**Parâmetros:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "description": "string (opcional)",
  "address": "string (opcional)",
  "is_public": "boolean (opcional, padrão: true)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Profissional cadastrado com sucesso",
  "professional": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "description": "Cabeleireiro especializado",
    "address": "Rua das Flores, 123",
    "is_public": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### POST `/api/professionals/login`
Realiza login de um profissional.

**Parâmetros:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Login realizado com sucesso",
  "professional": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "description": "Cabeleireiro especializado",
    "address": "Rua das Flores, 123",
    "is_public": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### POST `/api/professionals/logout`
Realiza logout do profissional.

**Resposta de Sucesso (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### GET `/api/professionals/profile`
Obtém o perfil do profissional logado.

**Resposta de Sucesso (200):**
```json
{
  "professional": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "description": "Cabeleireiro especializado",
    "address": "Rua das Flores, 123",
    "is_public": true,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### PUT `/api/professionals/profile`
Atualiza o perfil do profissional logado.

**Parâmetros:**
```json
{
  "name": "string (opcional)",
  "phone": "string (opcional)",
  "description": "string (opcional)",
  "address": "string (opcional)",
  "is_public": "boolean (opcional)"
}
```

### 4.2. Diretório de Profissionais

#### GET `/api/professionals/directory`
Lista todos os profissionais com agenda pública.

**Resposta de Sucesso (200):**
```json
{
  "professionals": [
    {
      "id": 1,
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "(11) 99999-9999",
      "description": "Cabeleireiro especializado",
      "address": "Rua das Flores, 123",
      "is_public": true,
      "created_at": "2024-01-01T10:00:00Z",
      "services": [
        {
          "id": 1,
          "name": "Corte de Cabelo",
          "description": "Corte masculino e feminino",
          "duration_minutes": 30,
          "price": 25.0,
          "requires_address": false
        }
      ]
    }
  ]
}
```

### 4.3. Gerenciamento de Serviços

#### POST `/api/services`
Cria um novo serviço (requer autenticação).

**Parâmetros:**
```json
{
  "name": "string",
  "description": "string (opcional)",
  "duration_minutes": "integer",
  "price": "float (opcional)",
  "requires_address": "boolean (opcional, padrão: false)"
}
```

#### GET `/api/services`
Lista os serviços do profissional logado.

#### PUT `/api/services/{service_id}`
Atualiza um serviço específico.

#### DELETE `/api/services/{service_id}`
Remove um serviço específico.

#### GET `/api/professionals/{professional_id}/services`
Lista os serviços ativos de um profissional específico (para clientes).

### 4.4. Gerenciamento de Horários

#### POST `/api/schedules`
Cria um novo horário de funcionamento (requer autenticação).

**Parâmetros:**
```json
{
  "day_of_week": "integer (0-6)",
  "start_time": "string (HH:MM)",
  "end_time": "string (HH:MM)",
  "break_start": "string (HH:MM, opcional)",
  "break_end": "string (HH:MM, opcional)",
  "max_appointments_per_slot": "integer (opcional, padrão: 1)"
}
```

#### GET `/api/schedules`
Lista os horários do profissional logado.

#### PUT `/api/schedules/{schedule_id}`
Atualiza um horário específico.

#### DELETE `/api/schedules/{schedule_id}`
Remove um horário específico.

#### GET `/api/professionals/{professional_id}/schedules`
Lista os horários ativos de um profissional específico (para clientes).

### 4.5. Agendamentos

#### POST `/api/appointments`
Cria um novo agendamento (não requer autenticação).

**Parâmetros:**
```json
{
  "professional_id": "integer",
  "service_id": "integer",
  "client_name": "string",
  "client_phone": "string",
  "client_email": "string (opcional)",
  "client_address": "string (se necessário para o serviço)",
  "appointment_date": "string (YYYY-MM-DD)",
  "appointment_time": "string (HH:MM)",
  "notes": "string (opcional)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "message": "Agendamento criado com sucesso",
  "appointment": {
    "id": 1,
    "professional_id": 1,
    "service_id": 1,
    "client_name": "Maria Santos",
    "client_phone": "(11) 88888-8888",
    "client_email": "maria@email.com",
    "appointment_date": "2024-01-15",
    "appointment_time": "14:00",
    "status": "agendado",
    "notes": "Primeira vez",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

#### GET `/api/appointments`
Lista os agendamentos do profissional logado (requer autenticação).

**Parâmetros de Query:**
- `date`: Filtrar por data específica (YYYY-MM-DD)
- `status`: Filtrar por status

#### PUT `/api/appointments/{appointment_id}`
Atualiza um agendamento específico (requer autenticação).

#### DELETE `/api/appointments/{appointment_id}`
Cancela um agendamento específico (requer autenticação).

#### GET `/api/professionals/{professional_id}/availability`
Verifica disponibilidade de horários para um profissional.

**Parâmetros de Query:**
- `date`: Data para verificar (YYYY-MM-DD)
- `service_id`: ID do serviço

**Resposta de Sucesso (200):**
```json
{
  "available_times": ["09:00", "09:30", "10:00", "14:00", "14:30"]
}
```

### 4.6. Relatórios

#### GET `/api/reports/dashboard`
Obtém estatísticas do dashboard (requer autenticação).

**Resposta de Sucesso (200):**
```json
{
  "stats": {
    "total_appointments": 150,
    "appointments_this_month": 25,
    "appointments_this_week": 8,
    "appointments_today": 3,
    "estimated_revenue": 1250.0
  },
  "status_distribution": [
    {"status": "agendado", "count": 10},
    {"status": "confirmado", "count": 12},
    {"status": "concluido", "count": 3}
  ],
  "popular_services": [
    {"service": "Corte de Cabelo", "count": 15},
    {"service": "Escova", "count": 8}
  ]
}
```

#### GET `/api/reports/appointments`
Relatório detalhado de agendamentos (requer autenticação).

**Parâmetros de Query:**
- `start_date`: Data de início (YYYY-MM-DD)
- `end_date`: Data de fim (YYYY-MM-DD)
- `status`: Filtrar por status
- `service_id`: Filtrar por serviço

#### GET `/api/reports/revenue`
Relatório de receita (requer autenticação).

**Parâmetros de Query:**
- `period`: Período (month, week, year)

#### GET `/api/reports/services-performance`
Relatório de performance dos serviços (requer autenticação).

**Parâmetros de Query:**
- `days`: Número de dias para análise (padrão: 30)


## 5. Instalação e Configuração

### 5.1. Pré-requisitos

- **Python 3.11+** instalado no sistema
- **Node.js 18+** e **pnpm** para o frontend
- **Git** para controle de versão

### 5.2. Instalação do Backend

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd agendamento-online
```

2. **Crie e ative o ambiente virtual:**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

4. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto backend:
```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
FLASK_ENV=development

# Database Configuration
DATABASE_URL=sqlite:///app.db

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

5. **Inicialize o banco de dados:**
```bash
python src/main.py
```
O banco de dados SQLite será criado automaticamente na primeira execução.

6. **Execute o servidor:**
```bash
python src/main.py
```
O servidor estará disponível em `http://localhost:5000`.

### 5.3. Instalação do Frontend

1. **Navegue para o diretório do frontend:**
```bash
cd agendamento-frontend
```

2. **Instale as dependências:**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente:**
Crie um arquivo `.env` na raiz do projeto frontend:
```env
VITE_API_URL=http://localhost:5000
```

4. **Execute o servidor de desenvolvimento:**
```bash
pnpm run dev
```
O frontend estará disponível em `http://localhost:5173`.

### 5.4. Configuração das Integrações (Opcional)

Para habilitar as notificações via WhatsApp, consulte o arquivo `INTEGRACOES.md` para instruções detalhadas sobre como configurar o n8n e a Evolution API.

## 6. Guia de Uso

### 6.1. Para Profissionais

#### 6.1.1. Cadastro e Login

1. **Acesse a página inicial** do sistema
2. **Clique em "Cadastrar-se"** no menu superior
3. **Preencha o formulário** com suas informações:
   - Nome completo
   - Email (será usado para login)
   - Telefone (para notificações)
   - Senha
   - Descrição dos serviços (opcional)
   - Endereço (opcional)
   - Marque se deseja que sua agenda seja pública
4. **Clique em "Criar Conta"**
5. **Faça login** com seu email e senha

#### 6.1.2. Configuração de Serviços

1. **Acesse o Dashboard** após fazer login
2. **Clique em "Novo Serviço"** ou acesse a seção de serviços
3. **Preencha as informações do serviço:**
   - Nome do serviço
   - Descrição
   - Duração em minutos
   - Preço (opcional)
   - Se requer endereço do cliente
4. **Salve o serviço**

Você pode criar quantos serviços desejar e ativá-los/desativá-los conforme necessário.

#### 6.1.3. Configuração de Horários

1. **Acesse a seção de horários** no dashboard
2. **Para cada dia da semana que trabalha:**
   - Selecione o dia (0=Segunda, 6=Domingo)
   - Defina horário de início e fim
   - Configure intervalos se necessário
   - Defina limite de agendamentos por horário
3. **Salve a configuração**

#### 6.1.4. Gerenciamento de Agendamentos

1. **Visualize agendamentos** no dashboard principal
2. **Filtre por data ou status** se necessário
3. **Para cada agendamento, você pode:**
   - Visualizar detalhes do cliente
   - Alterar status (confirmado, concluído, cancelado)
   - Adicionar observações
   - Cancelar se necessário

#### 6.1.5. Relatórios

1. **Acesse a seção de relatórios**
2. **Visualize estatísticas como:**
   - Total de agendamentos
   - Agendamentos por período
   - Receita estimada
   - Performance dos serviços
   - Distribuição por status
3. **Filtre por período** para análises específicas

### 6.2. Para Clientes

#### 6.2.1. Encontrar Profissionais

1. **Acesse a página inicial** do sistema
2. **Clique em "Ver Profissionais"** ou "Profissionais" no menu
3. **Use a busca** para encontrar profissionais por nome ou serviço
4. **Visualize os perfis** disponíveis com:
   - Informações de contato
   - Serviços oferecidos
   - Preços
   - Avaliações

#### 6.2.2. Fazer um Agendamento

1. **Selecione um profissional** e clique em "Agendar Horário"
2. **Escolha o serviço** desejado
3. **Selecione a data** disponível
4. **Escolha o horário** entre os disponíveis
5. **Preencha seus dados:**
   - Nome completo
   - Telefone (obrigatório para notificações)
   - Email (opcional)
   - Endereço (se necessário para o serviço)
   - Observações (opcional)
6. **Confirme o agendamento**

#### 6.2.3. Notificações

Após confirmar o agendamento, você receberá:
- **Confirmação imediata** via WhatsApp (se configurado)
- **Lembrete** 24 horas antes do agendamento
- **Notificações de alterações** se o profissional modificar algo

## 7. Funcionalidades Avançadas

### 7.1. Sistema de Validações

O sistema implementa diversas validações para garantir a integridade dos dados:

#### 7.1.1. Validações de Agendamento

- **Conflito de horários:** Verifica se o horário solicitado não conflita com outros agendamentos
- **Horário de funcionamento:** Garante que o agendamento está dentro do horário de trabalho do profissional
- **Intervalos:** Respeita os intervalos configurados pelo profissional
- **Limites de atendimento:** Verifica se o limite de agendamentos por horário não foi excedido
- **Duração do serviço:** Garante que o serviço não ultrapassa o horário de funcionamento

#### 7.1.2. Validações de Dados

- **Email:** Formato válido de email
- **Telefone:** Formato brasileiro com pelo menos 10 dígitos
- **Datas:** Não permite agendamentos em datas passadas
- **Horários:** Formato HH:MM válido

### 7.2. Sistema de Notificações

O sistema de notificações é modular e extensível:

#### 7.2.1. Tipos de Notificação

- **Confirmação de agendamento:** Enviada imediatamente após o agendamento
- **Lembrete:** Enviado 24 horas antes do agendamento
- **Cancelamento:** Enviado quando um agendamento é cancelado
- **Alterações:** Enviado quando há mudanças no agendamento

#### 7.2.2. Canais de Notificação

Atualmente implementado:
- **WhatsApp:** Via integração n8n + Evolution API

Facilmente extensível para:
- **SMS:** Através de APIs de SMS
- **Email:** Usando SMTP
- **Push notifications:** Para aplicativos móveis

### 7.3. Sistema de Relatórios

#### 7.3.1. Métricas Disponíveis

- **Agendamentos:** Total, por período, por status
- **Receita:** Estimada por período, por serviço
- **Performance:** Taxa de conclusão, cancelamento
- **Popularidade:** Serviços mais agendados
- **Tendências:** Evolução ao longo do tempo

#### 7.3.2. Visualizações

- **Gráficos de linha:** Para tendências temporais
- **Gráficos de barras:** Para comparações
- **Gráficos de pizza:** Para distribuições
- **Tabelas:** Para dados detalhados

## 8. Segurança

### 8.1. Autenticação

- **Hash de senhas:** Utiliza Werkzeug para hash seguro das senhas
- **Sessões:** Gerenciamento de sessões do Flask para manter login
- **Validação de entrada:** Todos os inputs são validados

### 8.2. Autorização

- **Separação de contextos:** Profissionais só acessam seus próprios dados
- **Validação de propriedade:** Verificação se o recurso pertence ao usuário logado
- **Agendas privadas:** Profissionais podem optar por não aparecer no diretório público

### 8.3. Proteção de Dados

- **CORS configurado:** Permite acesso apenas de origens autorizadas
- **Sanitização:** Dados são sanitizados antes de serem armazenados
- **Logs de segurança:** Tentativas de acesso não autorizado são registradas

## 9. Performance e Escalabilidade

### 9.1. Otimizações Implementadas

- **Consultas eficientes:** Uso de joins e índices apropriados
- **Cache de sessão:** Reduz consultas desnecessárias ao banco
- **Lazy loading:** Carregamento sob demanda de relacionamentos

### 9.2. Recomendações para Produção

#### 9.2.1. Banco de Dados

- **PostgreSQL:** Recomendado para produção
- **Índices:** Criar índices em campos frequentemente consultados
- **Backup:** Implementar rotina de backup automático

#### 9.2.2. Servidor

- **WSGI Server:** Usar Gunicorn ou uWSGI em produção
- **Reverse Proxy:** Nginx para servir arquivos estáticos
- **SSL/TLS:** Certificado SSL para HTTPS

#### 9.2.3. Monitoramento

- **Logs:** Implementar logging estruturado
- **Métricas:** Monitorar performance e uso
- **Alertas:** Configurar alertas para problemas críticos

## 10. Manutenção e Suporte

### 10.1. Logs do Sistema

Os logs são gerados automaticamente e incluem:
- **Erros de aplicação:** Exceções e falhas
- **Tentativas de login:** Sucessos e falhas
- **Notificações:** Status de envio
- **Performance:** Tempos de resposta

### 10.2. Backup e Recuperação

#### 10.2.1. Backup do Banco de Dados

Para SQLite (desenvolvimento):
```bash
cp src/database/app.db backup/app_$(date +%Y%m%d_%H%M%S).db
```

Para PostgreSQL (produção):
```bash
pg_dump -h localhost -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 10.2.2. Backup de Arquivos

```bash
tar -czf backup_files_$(date +%Y%m%d_%H%M%S).tar.gz agendamento-online/ agendamento-frontend/
```

### 10.3. Atualizações

#### 10.3.1. Processo de Atualização

1. **Backup completo** do sistema
2. **Teste em ambiente de desenvolvimento**
3. **Deploy em horário de menor uso**
4. **Verificação pós-deploy**
5. **Rollback se necessário**

#### 10.3.2. Versionamento

O sistema segue versionamento semântico (SemVer):
- **MAJOR:** Mudanças incompatíveis
- **MINOR:** Novas funcionalidades compatíveis
- **PATCH:** Correções de bugs

## 11. Troubleshooting

### 11.1. Problemas Comuns

#### 11.1.1. Backend não inicia

**Sintomas:** Erro ao executar `python src/main.py`

**Possíveis causas:**
- Dependências não instaladas
- Porta 5000 em uso
- Problemas de permissão

**Soluções:**
```bash
# Verificar dependências
pip install -r requirements.txt

# Verificar porta
lsof -i :5000

# Usar porta alternativa
export FLASK_RUN_PORT=5001
```

#### 11.1.2. Frontend não carrega

**Sintomas:** Página em branco ou erro de conexão

**Possíveis causas:**
- Backend não está rodando
- URL da API incorreta
- Problemas de CORS

**Soluções:**
```bash
# Verificar se backend está rodando
curl http://localhost:5000/api/professionals/directory

# Verificar configuração da API
cat .env

# Verificar logs do browser (F12)
```

#### 11.1.3. Notificações não funcionam

**Sintomas:** Agendamentos criados mas notificações não enviadas

**Possíveis causas:**
- n8n não configurado
- Evolution API não conectada
- Webhook URL incorreta

**Soluções:**
- Verificar configuração no arquivo `INTEGRACOES.md`
- Testar webhook manualmente
- Verificar logs do n8n e Evolution API

### 11.2. Logs de Debug

Para habilitar logs detalhados:

```python
# No main.py, adicionar:
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 11.3. Contato para Suporte

Para suporte técnico ou dúvidas sobre implementação:
- **Documentação:** Consulte este documento e `INTEGRACOES.md`
- **Issues:** Abra uma issue no repositório do projeto
- **Email:** [seu-email-de-suporte]

---

**Desenvolvido por:** Manus AI  
**Versão:** 1.0.0  
**Data:** Dezembro 2024

