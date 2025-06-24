# Script de Instalação Automatizada do Sistema de Agendamento Online (Linux Ubuntu 24)

Este script automatiza a instalação e configuração de todas as dependências e componentes necessários para o Sistema de Agendamento Online em um servidor Linux (Ubuntu Server 22.04 LTS ou superior).

## Funcionalidades do Script

- **Instalação de Pré-requisitos:** Atualiza o sistema e instala pacotes essenciais.
- **Instalação e Configuração do Python:** Instala Python 3.11 e configura um ambiente virtual para o backend.
- **Configuração do Backend:** Clona o repositório do backend e instala suas dependências.
- **Instalação e Configuração do PostgreSQL:** Oferece a opção de instalar e configurar um servidor PostgreSQL localmente ou conectar-se a um banco de dados externo.
- **Instalação e Configuração do Gunicorn:** Configura o Gunicorn como um serviço Systemd para gerenciar o backend Flask em produção.
- **Instalação e Configuração do Nginx:** Configura o Nginx como proxy reverso para servir o frontend e encaminhar requisições para o backend.
- **Configuração do Firewall (UFW):** Abre as portas necessárias no firewall.
- **Instalação do Node.js e pnpm:** Instala as ferramentas necessárias para o frontend.
- **Configuração do Frontend:** Clona o repositório do frontend, instala dependências e realiza o build para produção.
- **Geração de Arquivos de Configuração:** Cria automaticamente o arquivo `.env` para o backend com as configurações fornecidas.
- **Inicialização do Banco de Dados:** Executa o script para criar as tabelas no banco de dados.

## Pré-requisitos

- Um servidor Linux (Ubuntu Server 22.04 LTS ou superior).
- Acesso SSH ao servidor.
- **Usuário `root` ou um usuário com privilégios `sudo` e que possa executar comandos `sudo` sem senha (ou que você esteja disposto a digitar a senha `sudo` várias vezes).** O script foi projetado para ser executado como `root` ou com `sudo`.
- Conexão com a Internet.
- Repositórios do backend e frontend disponíveis (o script tentará cloná-los de URLs padrão, que você precisará ajustar no script).

## Como Usar o Script

1.  **Baixe o script para o seu servidor:**
    ```bash
    wget https://raw.githubusercontent.com/seu-usuario/seu-repo-do-script/main/install_agendamento_v2.sh
    # OU crie o arquivo manualmente e cole o conteúdo
    # nano install_agendamento_v2.sh
    ```
    **Nota:** Você precisará substituir `https://raw.githubusercontent.com/seu-usuario/seu-repo-do-script/main/install_agendamento_v2.sh` pela URL real onde você hospedar o script, ou copiar o conteúdo do script diretamente para um arquivo chamado `install_agendamento_v2.sh` no seu servidor.

2.  **Dê permissões de execução ao script:**
    ```bash
    chmod +x install_agendamento_v2.sh
    ```

3.  **Execute o script como `root`:**
    ```bash
    sudo ./install_agendamento_v2.sh
    ```

4.  **Siga as instruções interativas:** O script fará perguntas sobre a configuração do banco de dados, n8n, Evolution API e outros detalhes. Responda `s` para sim ou `n` para não, e forneça as informações solicitadas.

## Estrutura de Diretórios

O script criará a seguinte estrutura de diretórios para a aplicação:

-   `/var/www/agendamento-online/backend`: Contém o código do backend (Flask).
-   `/var/www/agendamento-online/frontend`: Contém o código do frontend (React).

## Logs

Um log detalhado de toda a instalação será salvo em `/var/log/agendamento_install.log`.

## Próximos Passos Após a Instalação

Após a conclusão bem-sucedida do script:

1.  **Acesse o Sistema:** Abra seu navegador e vá para o endereço IP ou domínio do seu servidor.
2.  **Configure o Workflow do n8n:** Se você estiver usando n8n externo, certifique-se de que o workflow para o WhatsApp está configurado corretamente.
3.  **Crie a Instância da Evolution API:** Se você estiver usando Evolution API externa, crie a instância do WhatsApp e escaneie o QR Code para conectar seu número.
4.  **Configurar HTTPS:** Para um ambiente de produção seguro, é **altamente recomendado** configurar HTTPS no Nginx usando certificados SSL/TLS (ex: Let\'s Encrypt).
5.  **Testar:** Realize testes completos de todas as funcionalidades do sistema.

---

**Desenvolvido por Manus AI**


