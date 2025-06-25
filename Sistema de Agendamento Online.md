# Sistema de Agendamento Online

Um sistema completo para conectar profissionais e clientes através de agendamentos online. Permite que profissionais gerenciem suas agendas e serviços, enquanto clientes podem agendar horários de forma simples, sem necessidade de criar conta.

## 🚀 Funcionalidades

### Para Profissionais
- ✅ Cadastro e gerenciamento de perfil
- ✅ Configuração de serviços (nome, duração, preço)
- ✅ Definição de horários de funcionamento
- ✅ Gerenciamento de agendamentos
- ✅ Relatórios e análises detalhadas
- ✅ Agenda pública ou privada
- ✅ Notificações via WhatsApp

### Para Clientes
- ✅ Busca de profissionais no diretório
- ✅ Agendamento sem necessidade de conta
- ✅ Verificação de disponibilidade em tempo real
- ✅ Notificações de confirmação e lembretes
- ✅ Interface intuitiva e responsiva

### Funcionalidades Técnicas
- ✅ API RESTful completa
- ✅ Validações inteligentes de conflitos
- ✅ Integração com n8n e Evolution API
- ✅ Sistema de relatórios com gráficos
- ✅ Arquitetura modular e escalável

## 🛠️ Tecnologias

### Backend
- **Python 3.11** com **Flask**
- **SQLAlchemy** (ORM)
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **Flask-CORS** para integração frontend/backend

### Frontend
- **React** com **JavaScript (JSX)**
- **Tailwind CSS** + **shadcn/ui** (componentes)
- **React Router** (roteamento)
- **Recharts** (gráficos)
- **Lucide Icons** (ícones)

### Integrações
- **n8n** (automação de workflows)
- **Evolution API** (WhatsApp)

## 📦 Instalação Rápida

### Pré-requisitos
- Python 3.11+
- Node.js 18+
- pnpm

### Backend
```bash
cd agendamento-online
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python src/main.py
```

### Frontend
```bash
cd agendamento-frontend
pnpm install
pnpm run dev
```

### Acesso
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 📖 Documentação

- **[Documentação Completa](DOCUMENTACAO.md)** - Guia detalhado de instalação, configuração e uso
- **[Integrações](INTEGRACOES.md)** - Configuração do n8n e Evolution API para WhatsApp

## 🎯 Como Usar

### 1. Para Profissionais
1. Acesse o sistema e clique em "Cadastrar-se"
2. Preencha seus dados e configure seu perfil
3. Adicione seus serviços (nome, duração, preço)
4. Configure seus horários de funcionamento
5. Comece a receber agendamentos!

### 2. Para Clientes
1. Acesse "Ver Profissionais" na página inicial
2. Busque por profissionais ou serviços
3. Clique em "Agendar Horário" no profissional desejado
4. Escolha serviço, data e horário
5. Preencha seus dados e confirme

## 📊 Screenshots

### Página Inicial
![Página Inicial](screenshots/home.png)

### Dashboard do Profissional
![Dashboard](screenshots/dashboard.png)

### Agendamento de Cliente
![Agendamento](screenshots/booking.png)

### Relatórios
![Relatórios](screenshots/reports.png)

## 🔧 Configuração Avançada

### Variáveis de Ambiente (Backend)
```env
SECRET_KEY=your-secret-key
N8N_WEBHOOK_URL=http://localhost:5678/webhook/whatsapp-notification
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
NOTIFICATIONS_ENABLED=true
```

### Variáveis de Ambiente (Frontend)
```env
VITE_API_URL=http://localhost:5000
```

## 🚀 Deploy

### Backend (Flask)
```bash
# Produção com Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app
```

### Frontend (React)
```bash
# Build para produção
pnpm run build
# Servir arquivos estáticos
pnpm run preview
```

## 📈 Roadmap

- [ ] Aplicativo móvel (React Native)
- [ ] Integração com calendários (Google, Outlook)
- [ ] Sistema de avaliações e comentários
- [ ] Pagamentos online
- [ ] Multi-idiomas
- [ ] API para integrações externas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Documentação:** [DOCUMENTACAO.md](DOCUMENTACAO.md)
- **Issues:** Abra uma issue neste repositório
- **Email:** [seu-email-de-suporte]

---

**Desenvolvido com ❤️ por Manus AI**

