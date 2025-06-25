#!/bin/bash

# --- Variáveis Globais e Funções de Utilitário ---

# Cores para saída do terminal
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[0;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

LOG_FILE="/var/log/agendamento_install.log"

# Função para logar mensagens
log_message() {
    echo -e "$(date "+%Y-%m-%d %H:%M:%S") [${1^^}] $2" | tee -a "$LOG_FILE"
}

# Função para exibir mensagens de sucesso
success() {
    log_message "success" "$1"
    echo -e "${GREEN}✔ $1${NC}"
}

# Função para exibir mensagens de erro e sair
error() {
    log_message "error" "$1"
    echo -e "${RED}✖ $1${NC}"
    exit 1
}

# Função para exibir mensagens de informação
info() {
    log_message "info" "$1"
    echo -e "${BLUE}ℹ $1${NC}"
}

# Função para exibir mensagens de aviso
warn() {
    log_message "warn" "$1"
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Função para verificar se o comando anterior foi bem-sucedido
check_command() {
    if [ $? -ne 0 ]; then
        error "Falha ao executar: $1. Verifique o log em $LOG_FILE para mais detalhes."
    fi
}

# Função para solicitar entrada do usuário
get_input() {
    local prompt_message="$1"
    local default_value="$2"
    local input_var="$3"

    read -rp "${BLUE}${prompt_message} [${default_value}]: ${NC}" user_input < /dev/tty
    if [ -z "$user_input" ]; then
        eval "$input_var=\"$default_value\""
    else
        eval "$input_var=\"$user_input\""
    fi
}

# Função para solicitar confirmação do usuário
confirm() {
    local prompt_message="$1"
    while true; do
        read -rp "${BLUE}${prompt_message} (s/n): ${NC}" yn < /dev/tty
        case $yn in
            [Ss]* ) return 0;;
            [Nn]* ) return 1;;
            * ) echo "Por favor, responda s ou n.";;
        esac
    done
}

# --- Estrutura de Diretórios ---

APP_DIR="/var/www/agendamento-online"
BACKEND_DIR="${APP_DIR}/backend"
FRONTEND_DIR="${APP_DIR}/frontend"

# --- Funções de Instalação ---

install_prerequisites() {
    info "Atualizando o sistema e instalando pré-requisitos..."
    sudo apt update && sudo apt upgrade -y
    check_command "apt update e upgrade"
    sudo apt install -y software-properties-common curl git
    check_command "instalação de pré-requisitos"
    success "Pré-requisitos instalados com sucesso."
}

install_python() {
    info "Instalando Python 3.11 e ambiente virtual..."
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    check_command "adicionar ppa:deadsnakes"
    sudo apt update
    check_command "apt update após adicionar ppa"
    sudo apt install -y python3.11 python3.11-venv python3.11-dev
    check_command "instalação Python 3.11"
    success "Python 3.11 e ambiente virtual instalados com sucesso."
}

setup_backend() {
    info "Configurando o backend da aplicação..."
    sudo mkdir -p "$BACKEND_DIR"
    check_command "criar diretório do backend"
    sudo chown -R "$SUDO_USER":"$SUDO_USER" "$BACKEND_DIR"
    check_command "alterar proprietário do diretório do backend"
    
    info "Clonando o repositório do backend..."
    if [ -d "$BACKEND_DIR" ] && [ "$(ls -A $BACKEND_DIR)" ]; then
        if confirm "O diretório $BACKEND_DIR já existe e não está vazio. Deseja remover o conteúdo existente para clonar o repositório novamente? (Isso apagará todos os arquivos dentro dele)"; then
            sudo rm -rf "$BACKEND_DIR"/*
            check_command "remover conteúdo existente do diretório do backend"
        else
            warn "Clonagem do repositório do backend ignorada. Certifique-se de que o código-fonte já está no diretório correto."
            return 0
        fi
    fi
    git clone https://github.com/sky6nove/agendamento-online.git "$BACKEND_DIR"
    check_command "clonar repositório do backend"

    cd "$BACKEND_DIR"
    python3.11 -m venv venv
    check_command "criar ambiente virtual do backend"
    source venv/bin/activate
    pip install -r requirements.txt
    check_command "instalar dependências do backend"
    deactivate
    success "Backend configurado com sucesso."
}

install_postgresql() {
    info "Instalando PostgreSQL..."
    sudo apt install -y postgresql postgresql-contrib
    check_command "instalação PostgreSQL"
    success "PostgreSQL instalado com sucesso."
}

configure_postgresql() {
    info "Configurando o banco de dados PostgreSQL..."
    local db_user="agendamento_user"
    local db_name="agendamento_db"
    local db_password

    get_input "Digite a senha para o usuário do banco de dados ($db_user)" "" db_password
    if [ -z "$db_password" ]; then
        error "A senha do banco de dados não pode ser vazia."
    fi

    # Escapa a senha para uso seguro no comando SQL
    local escaped_db_password=$(printf %q "$db_password")

    # Cria o usuário do banco de dados
    sudo -i -u postgres psql -c "CREATE USER $db_user WITH PASSWORD ${escaped_db_password};"
    check_command "criar usuário do banco de dados"

    # Cria o banco de dados e define o proprietário
    sudo -i -u postgres psql -c "CREATE DATABASE $db_name OWNER $db_user;"
    check_command "criar banco de dados"

    # Concede privilégios ao usuário no banco de dados
    sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name TO $db_user;"
    check_command "conceder privilégios ao banco de dados"

    success "Banco de dados PostgreSQL configurado com sucesso."
}

install_gunicorn() {
    info "Instalando Gunicorn..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    pip install gunicorn
    check_command "instalar gunicorn"
    deactivate
    success "Gunicorn instalado com sucesso."
}

install_nginx() {
    info "Instalando Nginx..."
    sudo apt install -y nginx
    check_command "instalar nginx"
    success "Nginx instalado com sucesso."
}

configure_nginx() {
    info "Configurando Nginx..."
    local domain_name
    get_input "Digite o nome de domínio ou IP do seu servidor (ex: meuagendamento.com ou 192.168.1.100)" "" domain_name
    if [ -z "$domain_name" ]; then
        error "O nome de domínio/IP não pode ser vazio."
    fi

    # Cria o arquivo de configuração do Nginx
    sudo bash -c "cat > /etc/nginx/sites-available/agendamento <<EOF
server {
    listen 80;
    server_name $domain_name;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static {
        alias ${BACKEND_DIR}/static;
    }
}
EOF"
    check_command "criar arquivo de configuração do Nginx"

    # Habilita o site
    sudo ln -sf /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
    check_command "habilitar site Nginx"

    # Remove o site default
    if [ -f /etc/nginx/sites-enabled/default ]; then
        sudo rm /etc/nginx/sites-enabled/default
        check_command "remover site default do Nginx"
    fi

    sudo nginx -t
    check_command "testar configuração Nginx"
    sudo systemctl restart nginx
    check_command "reiniciar Nginx"
    sudo systemctl enable nginx
    check_command "habilitar Nginx no boot"
    success "Nginx configurado com sucesso."
}

install_nodejs() {
    info "Instalando Node.js e pnpm..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    check_command "adicionar repositório Node.js"
    sudo apt install -y nodejs
    check_command "instalar Node.js"
    sudo npm install -g pnpm
    check_command "instalar pnpm"
    success "Node.js e pnpm instalados com sucesso."
}

setup_frontend() {
    info "Configurando o frontend da aplicação..."
    sudo mkdir -p "$FRONTEND_DIR"
    check_command "criar diretório do frontend"
    sudo chown -R "$SUDO_USER":"$SUDO_USER" "$FRONTEND_DIR"
    check_command "alterar proprietário do diretório do frontend"

    info "Clonando o repositório do frontend..."
    if [ -d "$FRONTEND_DIR" ] && [ "$(ls -A $FRONTEND_DIR)" ]; then
        if confirm "O diretório $FRONTEND_DIR já existe e não está vazio. Deseja remover o conteúdo existente para clonar o repositório novamente? (Isso apagará todos os arquivos dentro dele)"; then
            sudo rm -rf "$FRONTEND_DIR"/*
            check_command "remover conteúdo existente do diretório do frontend"
        else
            warn "Clonagem do repositório do frontend ignorada. Certifique-se de que o código-fonte já está no diretório correto."
            return 0
        fi
    fi
    git clone https://github.com/sky6nove/agendamento-online.git "$FRONTEND_DIR"
    check_command "clonar repositório do frontend"

    cd "$FRONTEND_DIR"
    pnpm install
    check_command "instalar dependências do frontend"
    pnpm run build
    check_command "build do frontend"
    success "Frontend configurado com sucesso."
}

create_systemd_service() {
    info "Criando serviço Systemd para o backend..."
    sudo bash -c "cat > /etc/systemd/system/agendamento.service <<EOF
[Unit]
Description=Gunicorn instance for Agendamento Online
After=network.target

[Service]
User=$SUDO_USER
Group=www-data
WorkingDirectory=${BACKEND_DIR}
ExecStart=${BACKEND_DIR}/venv/bin/gunicorn --workers 3 --bind unix:${BACKEND_DIR}/agendamento.sock -m 007 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF"
    check_command "criar arquivo de serviço Systemd"

    sudo systemctl daemon-reload
    check_command "recarregar daemon Systemd"
    sudo systemctl start agendamento
    check_command "iniciar serviço agendamento"
    sudo systemctl enable agendamento
    check_command "habilitar serviço agendamento no boot"
    success "Serviço Systemd para o backend criado e iniciado com sucesso."
}

configure_env_file() {
    info "Configurando o arquivo .env para o backend..."
    local db_host
    local db_port
    local db_user="agendamento_user"
    local db_password
    local db_name="agendamento_db"
    local n8n_webhook_url
    local evolution_api_url
    local evolution_api_key
    local evolution_instance

    if confirm "O banco de dados PostgreSQL está no mesmo servidor (local)?"; then
        db_host="localhost"
        db_port="5432"
        get_input "Digite a senha do usuário do banco de dados ($db_user)" "" db_password
        if [ -z "$db_password" ]; then
            error "A senha do banco de dados não pode ser vazia."
        fi
    else
        get_input "Digite o host do banco de dados PostgreSQL externo" "" db_host
        get_input "Digite a porta do banco de dados PostgreSQL externo" "5432" db_port
        get_input "Digite o usuário do banco de dados PostgreSQL externo" "$db_user" db_user
        get_input "Digite a senha do usuário do banco de dados PostgreSQL externo" "" db_password
        get_input "Digite o nome do banco de dados PostgreSQL externo" "$db_name" db_name
    fi

    get_input "Digite a URL do webhook do n8n (ex: https://n8n.skayy.shop/webhook/sua-webhook-id)" "https://n8n.skayy.shop" n8n_webhook_url
    get_input "Digite a URL da Evolution API (ex: https://api.skayy.shop)" "https://api.skayy.shop" evolution_api_url
    get_input "Digite a chave da Evolution API" "" evolution_api_key
    get_input "Digite o nome da instância da Evolution API" "" evolution_instance

    sudo bash -c "cat > ${BACKEND_DIR}/.env <<EOF
DATABASE_URL=postgresql+psycopg2://$db_user:$db_password@$db_host:$db_port/$db_name
N8N_WEBHOOK_URL=$n8n_webhook_url
EVOLUTION_API_URL=$evolution_api_url
EVOLUTION_API_KEY=$evolution_api_key
EVOLUTION_INSTANCE=$evolution_instance
NOTIFICATIONS_ENABLED=True
SEND_CONFIRMATION=True
SEND_REMINDERS=True
REMINDER_HOURS_BEFORE=24
EOF"
    check_command "criar arquivo .env"
    success "Arquivo .env configurado com sucesso."
}

initialize_database() {
    info "Inicializando o banco de dados..."
    cd "$BACKEND_DIR"
    source venv/bin/activate
    python -c "from src.main import app, db; with app.app_context(): db.create_all(); print('Banco de dados inicializado com sucesso!')"
    check_command "inicializar banco de dados"
    deactivate
    success "Banco de dados inicializado com sucesso."
}

configure_ufw() {
    info "Configurando o firewall (UFW)..."
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx HTTP'
    sudo ufw enable
    check_command "habilitar UFW"
    success "Firewall (UFW) configurado com sucesso."
}

# --- Função Principal de Instalação ---
main() {
    # Limpa o log anterior
    > "$LOG_FILE"
    log_message "info" "Iniciando o script de instalação do Agendamento Online."

    if [ "$(id -un)" != "root" ]; then
        error "Este script deve ser executado como root ou com sudo."
    fi

    install_prerequisites
    install_python
    setup_backend

    if confirm "Deseja instalar e configurar o PostgreSQL neste servidor?"; then
        install_postgresql
        configure_postgresql
    else
        warn "Instalação do PostgreSQL ignorada. Certifique-se de que o banco de dados externo está acessível e configurado."
    fi

    install_gunicorn
    install_nginx
    configure_nginx
    install_nodejs
    setup_frontend
    create_systemd_service
    configure_env_file
    initialize_database
    configure_ufw

    info "Instalação concluída!"
    info "O backend está rodando como um serviço Systemd. Você pode verificar o status com 'sudo systemctl status agendamento'."
    info "O frontend foi construído e está servido pelo Nginx."
    info "Acesse seu sistema em http://$(hostname -I | awk 

    info "Lembre-se de configurar os webhooks no n8n e Evolution API para apontar para o seu servidor."
    success "Instalação do sistema de agendamento online concluída com sucesso!"
}

# Executa a função principal
main


