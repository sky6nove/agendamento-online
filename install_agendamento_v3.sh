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
    local db_password="123456789"

    get_input "Digite a senha para o usuário do banco de dados ($db_user)" "" db_password
    if [ -z "$db_password" ]; then
        error "A senha do banco de dados não pode ser vazia."
    fi    # Cria o usuário do banco de dados
    sudo -i -u postgres bash -c "PGPASSWORD=\"${db_password}\" psql -c \"CREATE USER $db_user WITH PASSWORD E\\\"${db_password}\\\";\""
    check_command "criar usuário do banco de dados"  # Cria o banco de dados e define o proprietário
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
    check_command "instalar Gunicorn"
    deactivate
    success "Gunicorn instalado com sucesso."
}

configure_gunicorn_service() {
    info "Configurando serviço Systemd para Gunicorn..."
    sudo bash -c "cat > /etc/systemd/system/agendamento.service <<EOF
[Unit]
Description=Gunicorn instance for Agendamento Online
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=${BACKEND_DIR}
ExecStart=${BACKEND_DIR}/venv/bin/gunicorn --workers 3 --bind unix:${BACKEND_DIR}/agendamento.sock src.main:app
Restart=always

[Install]
WantedBy=multi-user.target
EOF"
    check_command "criar arquivo de serviço Gunicorn"

    sudo systemctl daemon-reload
    sudo systemctl start agendamento
    sudo systemctl enable agendamento
    check_command "habilitar e iniciar serviço Gunicorn"
    success "Serviço Gunicorn configurado e iniciado com sucesso."
}

install_nginx() {
    info "Instalando Nginx..."
    sudo apt install -y nginx
    check_command "instalação Nginx"
    success "Nginx instalado com sucesso."
}

configure_nginx() {
    info "Configurando Nginx como proxy reverso..."
    local domain_or_ip
    get_input "Digite o domínio ou IP do seu servidor (ex: meuagendamento.com ou 192.168.1.100)" "" domain_or_ip
    if [ -z "$domain_or_ip" ]; then
        error "O domínio ou IP do servidor não pode ser vazio."
    fi

    sudo bash -c "cat > /etc/nginx/sites-available/agendamento <<EOF
server {
    listen 80;
    server_name ${domain_or_ip};

    location / {
        root ${FRONTEND_DIR}/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        include proxy_params;
        proxy_pass http://unix:${BACKEND_DIR}/agendamento.sock;
    }
}
EOF"
    check_command "criar arquivo de configuração Nginx"

    sudo ln -s /etc/nginx/sites-available/agendamento /etc/nginx/sites-enabled/
    check_command "criar link simbólico para Nginx"
    sudo rm -f /etc/nginx/sites-enabled/default
    check_command "remover configuração padrão do Nginx"

    sudo nginx -t
    check_command "testar configuração Nginx"
    sudo systemctl restart nginx
    check_command "reiniciar Nginx"
    success "Nginx configurado e iniciado com sucesso."
}

configure_ufw() {
    info "Configurando Firewall (UFW)..."
    sudo ufw allow 'Nginx HTTP'
    check_command "permitir Nginx HTTP no UFW"
    if confirm "Deseja permitir HTTPS (porta 443) no firewall? (Recomendado para produção com SSL)"; then
        sudo ufw allow 'Nginx HTTPS'
        check_command "permitir Nginx HTTPS no UFW"
    fi
    sudo ufw enable
    check_command "habilitar UFW"
    sudo ufw status
    success "Firewall (UFW) configurado com sucesso."
}

install_nodejs_pnpm() {
    info "Instalando Node.js e pnpm..."
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
    check_command "adicionar repositório NodeSource"
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
    git clone https://github.com/sky6nove/agendamento-online.git "$FRONTEND_DIR"
    check_command "clonar repositório do frontend"

    cd "$FRONTEND_DIR"
    pnpm install
    check_command "instalar dependências do frontend"

    local api_url
    get_input "Digite a URL da API do backend (ex: http://seu_dominio_ou_ip/api)" "http://localhost/api" api_url
    echo "VITE_API_URL=${api_url}" > .env
    check_command "criar arquivo .env do frontend"

    pnpm run build
    check_command "construir frontend para produção"
    success "Frontend configurado e construído com sucesso."
}

create_backend_env_file() {
    info "Criando arquivo .env para o backend..."
    local db_type
    local db_host
    local db_port
    local db_user
    local db_password
    local db_name
    local n8n_webhook_url
    local evolution_api_url
    local evolution_api_key
    local evolution_instance

    confirm "O banco de dados PostgreSQL será instalado neste servidor?" && db_type="local" || db_type="external"

    if [ "$db_type" == "local" ]; then
        db_host="localhost"
        db_port="5432"
        db_user="agendamento_user"
        get_input "Digite a senha do usuário do banco de dados ($db_user)" "" db_password
        db_name="agendamento_db"
    else
        get_input "Digite o host do banco de dados externo" "" db_host
        get_input "Digite a porta do banco de dados externo" "5432" db_port
        get_input "Digite o usuário do banco de dados externo" "" db_user
        get_input "Digite a senha do usuário do banco de dados externo" "" db_password
        get_input "Digite o nome do banco de dados externo" "" db_name
    fi

    get_input "Digite a URL completa do webhook do n8n externo (ex: https://n8n.skayy.shop/webhook/sua-webhook-id)" "https://n8n.skayy.shop/webhook/sua-webhook-id" n8n_webhook_url
    get_input "Digite a URL da Evolution API externa (ex: https://api.skayy.shop)" "https://api.skayy.shop" evolution_api_url
    get_input "Digite a chave de API da Evolution API externa" "" evolution_api_key
    get_input "Digite o nome da instância da Evolution API externa (ex: instance1)" "instance1" evolution_instance

    sudo bash -c "cat > ${BACKEND_DIR}/.env <<EOF
# Configurações do Banco de Dados
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}

# Configurações do n8n (para notificações WhatsApp)
N8N_WEBHOOK_URL=${n8n_webhook_url}

# Configurações da Evolution API (para notificações WhatsApp)
EVOLUTION_API_URL=${evolution_api_url}
EVOLUTION_API_KEY=${evolution_api_key}
EVOLUTION_INSTANCE=${evolution_instance}

# Configurações de Notificação
NOTIFICATIONS_ENABLED=true
SEND_CONFIRMATION=true
SEND_REMINDERS=true
REMINDER_HOURS_BEFORE=24
EOF"
    check_command "criar arquivo .env do backend"
    success "Arquivo .env do backend criado com sucesso."
}

initialize_database() {
    info "Inicializando o banco de dados..."
    sudo bash -c "cat > ${BACKEND_DIR}/initialize_db.py <<EOF
from src.main import app, db

with app.app_context():
    db.create_all()
    print(\"Banco de dados inicializado com sucesso!\")
EOF"
    check_command "criar script initialize_db.py"

    cd "$BACKEND_DIR"
    source venv/bin/activate
    python initialize_db.py
    check_command "executar script de inicialização do banco de dados"
    deactivate
    success "Banco de dados inicializado com sucesso."
}

# --- Função Principal de Instalação ---

main() {
    if [ "$(id -u)" -ne 0 ]; then
        error "Este script deve ser executado como root. Use 'sudo bash install.sh'."
    fi

    info "Iniciando a instalação automatizada do Sistema de Agendamento Online..."
    info "O log detalhado da instalação será salvo em $LOG_FILE"

    install_prerequisites
    install_python
    setup_backend

    if confirm "Deseja instalar o PostgreSQL neste servidor? (Recomendado para a maioria dos casos)"; then
        install_postgresql
        configure_postgresql
    else
        warn "Você optou por não instalar o PostgreSQL localmente. Certifique-se de que seu banco de dados externo está acessível e configurado."
    fi

    install_gunicorn
    configure_gunicorn_service
    install_nginx
    configure_nginx
    configure_ufw
    install_nodejs_pnpm
    setup_frontend

    create_backend_env_file
    initialize_database

    success "Instalação do Sistema de Agendamento Online concluída com sucesso!"
    info "Acesse seu sistema em: http://$(hostname -I | awk '{print $1}')"
    info "Lembre-se de configurar o workflow do WhatsApp no n8n e a instância na Evolution API."
    info "Para mais detalhes, consulte o log em $LOG_FILE."
}

# Executa a função principal
main
