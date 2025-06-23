# Guia de Instalação em Produção - Windows Server 2022

Este guia detalha o processo de instalação e configuração das tecnologias necessárias para o sistema de agendamento online em um ambiente de produção no Windows Server 2022. Ele é destinado a usuários iniciantes, com instruções passo a passo.

## 1. Introdução

Para garantir a estabilidade, segurança e performance do sistema de agendamento em um ambiente de produção, é fundamental configurar corretamente o servidor. Este guia abordará a instalação de:

- **Python 3.11+:** Para o backend da aplicação Flask.
- **PostgreSQL:** Como banco de dados robusto e escalável.
- **Gunicorn:** Servidor WSGI para o Flask (execução em produção).
- **Nginx:** Servidor web reverso para servir o frontend e proxy reverso para o backend.
- **Node.js e pnpm:** Para o desenvolvimento e build do frontend React.
- **Frontend React:** A aplicação web que interage com os usuários.
- **n8n e Evolution API:** Para o envio de notificações via WhatsApp.

## 2. Pré-requisitos

Antes de iniciar a instalação, certifique-se de que seu Windows Server 2022 possui:

- **Acesso de Administrador:** Você precisará de permissões de administrador para instalar softwares e configurar serviços.
- **Conexão com a Internet:** Para baixar os pacotes e dependências necessárias.
- **Recursos Mínimos:** Recomenda-se pelo menos 4GB de RAM e 2 vCPUs para um ambiente de produção pequeno a médio. Para ambientes maiores, ajuste conforme a demanda.
- **Firewall:** Certifique-se de que as portas necessárias (80, 443 para HTTP/HTTPS, 5000 para o backend, 5432 para PostgreSQL, 5678 para n8n, 8080 para Evolution API) estejam abertas no firewall do Windows e em qualquer firewall de rede externo.

## 3. Instalação do Python e Ambiente Virtual

O Python é a linguagem de programação utilizada pelo backend da aplicação. É crucial instalar a versão correta e configurar um ambiente virtual para isolar as dependências do projeto.

### 3.1. Baixar e Instalar o Python

1. **Acesse o site oficial do Python:** Abra seu navegador e vá para [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/) [1].
2. **Baixe o instalador:** Procure pela versão mais recente do Python 3.11.x (por exemplo, Python 3.11.9) e baixe o instalador executável de 64 bits (`Windows installer (64-bit)`).
3. **Execute o instalador:** Localize o arquivo `.exe` baixado e clique duas vezes para executá-lo.
4. **Importante - Marque a opção "Add Python to PATH":** Na primeira tela do instalador, **certifique-se de marcar a caixa de seleção "Add Python.exe to PATH"**. Isso permitirá que você execute comandos Python de qualquer diretório no Prompt de Comando ou PowerShell. [2]
5. **Instalação Personalizada (Recomendado):** Escolha "Customize installation" para ter mais controle. Na próxima tela, mantenha todas as opções padrão marcadas.
6. **Opções Avançadas:** Na tela de "Advanced Options", você pode escolher o diretório de instalação. O padrão (`C:\Program Files\Python311`) geralmente é adequado. Marque "Install for all users".
7. **Conclua a instalação:** Clique em "Install" e aguarde o processo ser concluído. Pode levar alguns minutos.

### 3.2. Verificar a Instalação do Python

1. **Abra o Prompt de Comando ou PowerShell:** Pressione `Win + R`, digite `cmd` ou `powershell` e pressione `Enter`.
2. **Verifique a versão do Python:** Digite o seguinte comando e pressione `Enter`:
   ```bash
   python --version
   ```
   Você deverá ver a versão do Python instalada (ex: `Python 3.11.9`). Se você vir um erro, verifique se a opção "Add Python to PATH" foi marcada durante a instalação ou adicione-o manualmente às variáveis de ambiente do sistema.
3. **Verifique a versão do pip:** O `pip` é o gerenciador de pacotes do Python. Digite:
   ```bash
   pip --version
   ```
   Você deverá ver a versão do pip instalada.

### 3.3. Criar e Ativar um Ambiente Virtual

Um ambiente virtual é uma ferramenta que permite isolar as dependências de um projeto Python de outros projetos. Isso evita conflitos de pacotes e mantém seu ambiente de desenvolvimento limpo.

1. **Navegue até o diretório do seu projeto:** Use o Prompt de Comando ou PowerShell para ir até a pasta onde você clonou o repositório do backend do sistema de agendamento (ex: `C:\agendamento-online`).
   ```bash
   cd C:\caminho\para\seu\projeto\agendamento-online
   ```
2. **Crie o ambiente virtual:** Digite o seguinte comando:
   ```bash
   python -m venv venv
   ```
   Isso criará uma pasta chamada `venv` dentro do seu diretório de projeto, contendo os arquivos do ambiente virtual.
3. **Ative o ambiente virtual:** Para começar a usar o ambiente virtual, execute:
   ```bash
   .\venv\Scripts\activate
   ```
   Você notará que o nome `(venv)` aparecerá no início da linha de comando, indicando que o ambiente virtual está ativo. Todas as instalações de pacotes `pip` agora serão feitas dentro deste ambiente.

4. **Instale as dependências do projeto:** Com o ambiente virtual ativo, navegue até a pasta do backend (`agendamento-online`) e instale as dependências listadas no arquivo `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
   Este comando instalará todas as bibliotecas Python necessárias para o funcionamento do backend (Flask, SQLAlchemy, Gunicorn, etc.).

## 4. Instalação e Configuração do PostgreSQL

O PostgreSQL é um sistema de gerenciamento de banco de dados relacional robusto e de código aberto, ideal para ambientes de produção.

### 4.1. Baixar e Instalar o PostgreSQL

1. **Acesse o site oficial do PostgreSQL:** Vá para [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/) [3].
2. **Baixe o instalador:** Clique no link para baixar o instalador para Windows (geralmente o "EDB installer"). Escolha a versão mais recente estável (ex: PostgreSQL 16.x).
3. **Execute o instalador:** Clique duas vezes no arquivo `.exe` baixado.
4. **Siga o assistente de instalação:**
   - **Installation Directory:** Mantenha o padrão ou escolha um local de sua preferência (ex: `C:\Program Files\PostgreSQL\16`).
   - **Select Components:** Certifique-se de que `PostgreSQL Server`, `pgAdmin 4` (ferramenta gráfica para gerenciar o banco de dados) e `Command Line Tools` estejam selecionados.
   - **Data Directory:** Mantenha o padrão ou escolha um local para armazenar os dados do banco de dados.
   - **Password for postgres superuser:** **Defina uma senha forte** para o usuário `postgres`. **Anote esta senha**, pois você precisará dela para acessar o banco de dados.
   - **Port:** Mantenha a porta padrão `5432`.
   - **Advanced Options:** Mantenha o padrão.
5. **Conclua a instalação:** Clique em "Next" e "Finish" para completar o processo.

### 4.2. Configurar o Banco de Dados para o Projeto

Após a instalação, você precisará criar um banco de dados e um usuário específico para a sua aplicação.

1. **Abra o pgAdmin 4:** Você pode encontrá-lo no menu Iniciar. Ele abrirá no seu navegador padrão.
2. **Conecte-se ao servidor PostgreSQL:**
   - No pgAdmin, clique em "Servers" no painel esquerdo.
   - Clique duas vezes em "PostgreSQL 16" (ou a versão que você instalou).
   - Digite a senha do usuário `postgres` que você definiu durante a instalação.
3. **Crie um novo banco de dados:**
   - Clique com o botão direito em "Databases" e selecione "Create" -> "Database...".
   - **Name:** Digite um nome para o seu banco de dados (ex: `agendamento_db`).
   - **Owner:** Mantenha `postgres` ou crie um novo usuário (recomendado para produção).
   - Clique em "Save".
4. **Crie um novo usuário (Role) para a aplicação (Recomendado):**
   - Clique com o botão direito em "Login/Group Roles" e selecione "Create" -> "Login/Group Role...".
   - **Name:** Digite um nome para o usuário (ex: `agendamento_user`).
   - **Definition Tab:** Defina uma **senha forte** para este usuário.
   - **Privileges Tab:** Conceda as permissões necessárias (ex: `Can login`, `Create database` - se a aplicação precisar criar o DB, `Create roles` - se precisar criar outros usuários). Para a maioria das aplicações, `Can login` é suficiente, e você concederá permissões ao banco de dados específico.
   - Clique em "Save".
5. **Conceda permissões ao usuário no banco de dados:**
   - Clique com o botão direito no banco de dados `agendamento_db` que você criou.
   - Selecione "Properties" -> "Privileges".
   - Adicione o usuário `agendamento_user` e conceda as permissões `CONNECT` e `CREATE` (se a aplicação for gerenciar tabelas).
   - Clique em "Save".

### 4.3. Configurar a Conexão no Backend

No arquivo `.env` do seu projeto backend (`agendamento-online`), atualize a variável `DATABASE_URL` para apontar para o PostgreSQL:

```env
DATABASE_URL=postgresql://agendamento_user:sua_senha_forte@localhost:5432/agendamento_db
```

Substitua `agendamento_user`, `sua_senha_forte` e `agendamento_db` pelos valores que você definiu.

## 5. Instalação e Configuração do Gunicorn e Nginx

Em produção, o Flask não deve ser executado diretamente. O Gunicorn é um servidor WSGI que gerencia a execução do Flask, e o Nginx atuará como um proxy reverso, servindo arquivos estáticos e encaminhando requisições para o Gunicorn.

### 5.1. Instalar Gunicorn

O Gunicorn é um pacote Python, então ele deve ser instalado dentro do seu ambiente virtual do backend:

1. **Ative o ambiente virtual** (se ainda não estiver ativo):
   ```bash
   cd C:\caminho\para\seu\projeto\agendamento-online
   .\venv\Scripts\activate
   ```
2. **Instale o Gunicorn:**
   ```bash
   pip install gunicorn
   ```

### 5.2. Instalar Nginx no Windows

O Nginx não possui um instalador tradicional para Windows. Você precisará baixá-lo e configurá-lo manualmente.

1. **Baixe o Nginx:** Acesse [http://nginx.org/en/download.html](http://nginx.org/en/download.html) [4] e baixe a versão estável mais recente para Windows (ex: `nginx/Windows-1.24.0`).
2. **Extraia os arquivos:** Descompacte o arquivo `.zip` baixado para um diretório de sua escolha (ex: `C:\nginx`).
3. **Teste o Nginx:**
   - Abra o Prompt de Comando ou PowerShell.
   - Navegue até o diretório onde você extraiu o Nginx (ex: `cd C:\nginx`).
   - Execute o Nginx:
     ```bash
     start nginx
     ```
   - Abra seu navegador e vá para `http://localhost`. Você deverá ver a página de boas-vindas do Nginx.
   - Para parar o Nginx, execute:
     ```bash
     nginx -s stop
     ```
     ou para recarregar a configuração:
     ```bash
     nginx -s reload
     ```

### 5.3. Configurar Nginx como Proxy Reverso

Você precisará configurar o Nginx para:
- Servir os arquivos estáticos do frontend (React).
- Encaminhar as requisições da API (`/api`) para o Gunicorn (que estará rodando o Flask).

1. **Edite o arquivo de configuração do Nginx:** Abra o arquivo `C:\nginx\conf\nginx.conf` em um editor de texto (como Notepad++ ou VS Code).
2. **Modifique a seção `http` e `server`:** Substitua o conteúdo existente dentro da seção `http` por algo semelhante a isto. **Atenção aos caminhos e portas!**

   ```nginx
   http {
       include       mime.types;
       default_type  application/octet-stream;

       sendfile        on;
       keepalive_timeout  65;

       # Configuração para o backend Gunicorn
       upstream backend_app {
           server 127.0.0.1:5000; # Porta onde o Gunicorn estará rodando
       }

       server {
           listen       80;
           server_name  localhost;

           # Servir arquivos estáticos do frontend
           location / {
               root   C:/caminho/para/seu/projeto/agendamento-frontend/dist; # Caminho para a pasta 'dist' do build do React
               index  index.html;
               try_files $uri $uri/ /index.html;
           }

           # Proxy para o backend API
           location /api/ {
               proxy_pass http://backend_app;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
               proxy_set_header X-Forwarded-Proto $scheme;
           }

           error_page   500 502 503 504  /50x.html;
           location = /50x.html {
               root   html;
           }
       }
   }
   ```
   **Ajuste os caminhos:**
   - `root C:/caminho/para/seu/projeto/agendamento-frontend/dist;`: Altere para o caminho real da pasta `dist` do seu frontend React (que será gerada após o build).
   - `server 127.0.0.1:5000;`: Certifique-se de que esta é a porta que o Gunicorn usará para o backend.

3. **Salve o arquivo `nginx.conf`**.

### 5.4. Executar o Backend com Gunicorn

Para executar o backend em produção, você usará o Gunicorn. Certifique-se de que seu ambiente virtual esteja ativo.

1. **Navegue até o diretório do backend:**
   ```bash
   cd C:\caminho\para\seu\projeto\agendamento-online
   ```
2. **Execute o Gunicorn:**
   ```bash
   gunicorn --bind 0.0.0.0:5000 src.main:app
   ```
   - `--bind 0.0.0.0:5000`: O Gunicorn ouvirá em todas as interfaces na porta 5000.
   - `src.main:app`: Indica que o aplicativo Flask (`app`) está no módulo `main.py` dentro da pasta `src`.

   **Para manter o Gunicorn rodando em segundo plano (produção):**
   Você pode usar ferramentas como `NSSM` (Non-Sucking Service Manager) para instalar o Gunicorn como um serviço do Windows, garantindo que ele inicie automaticamente com o servidor e seja reiniciado em caso de falha. [5]

   **Exemplo básico com NSSM:**
   - Baixe o NSSM de [https://nssm.cc/download](https://nssm.cc/download) [6].
   - Extraia o `nssm.exe` para um local acessível (ex: `C:\Windows\System32`).
   - Abra o Prompt de Comando como Administrador e execute:
     ```bash
     nssm install agendamento-backend
     ```
   - Na janela do NSSM:
     - **Path:** `C:\caminho\para\seu\projeto\agendamento-online\venv\Scripts\gunicorn.exe`
     - **Arguments:** `--bind 0.0.0.0:5000 src.main:app`
     - **Startup directory:** `C:\caminho\para\seu\projeto\agendamento-online`
     - Vá para a aba "Details" e defina um nome de exibição.
     - Vá para a aba "Log On" e selecione "Local System account" ou uma conta de usuário com as permissões necessárias.
     - Clique em "Install service".
   - Para iniciar o serviço:
     ```bash
     net start agendamento-backend
     ```

### 5.5. Iniciar o Nginx

Após configurar o Nginx, inicie-o ou recarregue sua configuração:

1. **Abra o Prompt de Comando ou PowerShell como Administrador.**
2. **Navegue até o diretório do Nginx:**
   ```bash
   cd C:\nginx
   ```
3. **Inicie ou recarregue:**
   ```bash
   nginx -s reload  # Se já estiver rodando
   # ou
   start nginx      # Se não estiver rodando
   ```

   **Para manter o Nginx rodando em segundo plano (produção):**
   Assim como o Gunicorn, você pode usar o NSSM para instalar o Nginx como um serviço do Windows. [7]

   **Exemplo básico com NSSM para Nginx:**
   - Abra o Prompt de Comando como Administrador e execute:
     ```bash
     nssm install nginx-service
     ```
   - Na janela do NSSM:
     - **Path:** `C:\nginx\nginx.exe`
     - **Arguments:** (deixe em branco)
     - **Startup directory:** `C:\nginx`
     - Clique em "Install service".
   - Para iniciar o serviço:
     ```bash
     net start nginx-service
     ```

## 6. Instalação do Node.js e pnpm

O Node.js é necessário para construir o frontend React, e o pnpm é um gerenciador de pacotes eficiente.

### 6.1. Baixar e Instalar o Node.js

1. **Acesse o site oficial do Node.js:** Vá para [https://nodejs.org/en/download/](https://nodejs.org/en/download/) [8].
2. **Baixe o instalador:** Baixe a versão LTS (Long Term Support) recomendada para Windows (ex: `Windows Installer (.msi) 64-bit`).
3. **Execute o instalador:** Clique duas vezes no arquivo `.msi` baixado.
4. **Siga o assistente de instalação:**
   - Mantenha as opções padrão. Certifique-se de que "Add to PATH" esteja selecionado.
   - O instalador também instalará o npm (Node Package Manager).
5. **Conclua a instalação.**

### 6.2. Verificar a Instalação do Node.js e npm

1. **Abra o Prompt de Comando ou PowerShell.**
2. **Verifique a versão do Node.js:**
   ```bash
   node -v
   ```
3. **Verifique a versão do npm:**
   ```bash
   npm -v
   ```

### 6.3. Instalar pnpm

O pnpm é um gerenciador de pacotes alternativo ao npm, conhecido por sua eficiência e uso otimizado de espaço em disco.

1. **Instale o pnpm globalmente:**
   ```bash
   npm install -g pnpm
   ```
2. **Verifique a instalação do pnpm:**
   ```bash
   pnpm -v
   ```

## 7. Configuração e Build do Frontend (React)

Após instalar o Node.js e o pnpm, você precisará configurar e construir a aplicação React para produção.

1. **Navegue até o diretório do frontend:**
   ```bash
   cd C:\caminho\para\seu\projeto\agendamento-frontend
   ```
2. **Instale as dependências do frontend:**
   ```bash
   pnpm install
   ```
3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto frontend (`agendamento-frontend`) e adicione a URL da sua API (que será servida pelo Nginx):
   ```env
   VITE_API_URL=http://seu_dominio_ou_ip/api
   ```
   Substitua `seu_dominio_ou_ip` pelo domínio ou endereço IP do seu servidor onde o Nginx está rodando.

4. **Construa a aplicação para produção:**
   ```bash
   pnpm run build
   ```
   Este comando criará uma pasta `dist` dentro do seu diretório `agendamento-frontend`. Esta pasta contém todos os arquivos estáticos otimizados para produção que o Nginx servirá.

5. **Atualize a configuração do Nginx:** Conforme mencionado na Seção 5.3, certifique-se de que a diretiva `root` no Nginx aponte para esta nova pasta `dist`.
   ```nginx
   location / {
       root   C:/caminho/para/seu/projeto/agendamento-frontend/dist; # Caminho para a pasta 'dist' do build do React
       index  index.html;
       try_files $uri $uri/ /index.html;
   }
   ```
   Após atualizar o `nginx.conf`, lembre-se de recarregar o Nginx (`nginx -s reload`).

## 8. Configuração do n8n e Evolution API para Notificações WhatsApp

Esta seção aborda a configuração do n8n e da Evolution API para o envio de notificações via WhatsApp. Recomenda-se a instalação via Docker para maior facilidade e isolamento.

### 8.1. Instalar Docker no Windows Server 2022

1. **Habilitar o recurso Hyper-V:**
   - Abra o PowerShell como Administrador.
   - Execute:
     ```powershell
     Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
     ```
   - Reinicie o servidor se solicitado.

2. **Instalar o Docker Desktop:**
   - Baixe o instalador do Docker Desktop para Windows em [https://docs.docker.com/desktop/install/windows-install/](https://docs.docker.com/desktop/install/windows-install/) [9].
   - Execute o instalador e siga as instruções. Certifique-se de que a opção "Install required Windows components for WSL 2" esteja marcada (mesmo que você não use WSL 2, é bom ter os componentes).
   - Após a instalação, o Docker Desktop será iniciado. Pode ser necessário reiniciar o servidor novamente.

3. **Configurar o Docker Desktop:**
   - Abra o Docker Desktop. Vá em "Settings" (ícone de engrenagem).
   - Em "Resources" -> "WSL Integration", desmarque a opção "Enable integration with my default WSL distro" se você não usa WSL. Isso pode liberar recursos.
   - Em "Resources" -> "Advanced", você pode ajustar a quantidade de CPU e memória que o Docker pode usar.
   - Em "Docker Engine", você pode adicionar configurações personalizadas, como `"bip": "172.17.0.1/16"` para definir uma sub-rede específica para o Docker, se houver conflitos de rede.

### 8.2. Configurar a Evolution API com Docker Compose

1. **Crie um diretório para a Evolution API:**
   ```bash
   mkdir C:\evolution-api
   cd C:\evolution-api
   ```
2. **Crie o arquivo `docker-compose.yml`:** Use um editor de texto e salve o seguinte conteúdo como `docker-compose.yml` dentro da pasta `C:\evolution-api`:
   ```yaml
   version: '3.8'

   services:
     evolution-api:
       image: evolutionapi/evolution-api:latest
       container_name: evolution-api
       restart: always
       ports:
         - 

