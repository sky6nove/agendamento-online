## Tarefas para o Script de Instalação Automatizado (Linux)

### Fase 1: Planejamento e Estruturação do Script de Instalação
- [ ] Definir a estrutura geral do script (funções, seções).
- [ ] Listar todas as entradas do usuário necessárias (tipo de DB, localização do n8n/Evolution API, caminhos).
- [ ] Esboçar os passos de instalação para cada componente com base no guia manual anterior.
- [ ] Planejar o tratamento de erros e logging.
- [ ] Definir a estrutura de diretórios para a aplicação.

### Fase 2: Desenvolvimento do Script: Parte 1 (Setup Básico, Python, PostgreSQL)
- [x] Implementar a atualização do sistema e instalação de pacotes essenciais.
- [x] Implementar a instalação do Python e criação do ambiente virtual.
- [x] Implementar a instalação e configuração do PostgreSQL (local).
- [x] Implementar a lógica para conexão com PostgreSQL externo.

### Fase 3: Desenvolvimento do Script: Parte 2 (Gunicorn, Nginx, Node.js, Frontend)
- [x] Implementar a instalação e configuração do Gunicorn (serviço Systemd).
- [x] Implementar a instalação e configuração do Nginx (proxy reverso).
- [x] Implementar a instalação do Node.js e pnpm.
- [x] Implementar o build do frontend (React).

### Fase 4: Desenvolvimento do Script: Parte 3 (Docker, n8n, Evolution API, Variáveis de Ambiente)
- [x] Implementar a instalação do Docker e Docker Compose.
- [x] Implementar a configuração da Evolution API via Docker Compose (local ou externo).
- [x] Implementar a configuração do n8n via Docker Compose (local ou externo).
- [x] Implementar a geração e configuração do arquivo `.env`.

### Fase 5: Revisão, Teste e Documentação Final do Script
- [x] Adicionar validações de entrada do usuário.
- [x] Adicionar tratamento de erros robusto.
- [x] Adicionar mensagens de progresso e feedback ao usuário.
- [x] Testar o script em um ambiente limpo.
- [x] Criar um README detalhado para o script.

### Fase 6: Entrega do Script e Instruções ao Usuário
- [ ] Fornecer o script ao usuário.
- [ ] Explicar como executar o script e os parâmetros.
- [ ] Oferecer suporte para dúvidas.

