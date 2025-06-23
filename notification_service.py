import requests
import json
from datetime import datetime
from src.models.professional import db
from src.models.appointment import Appointment

class NotificationService:
    def __init__(self):
        # Configurações para n8n webhook
        self.n8n_webhook_url = "http://localhost:5678/webhook/whatsapp-notification"
        
        # Configurações para Evolution API
        self.evolution_api_url = "http://localhost:8080"
        self.evolution_api_key = "your-evolution-api-key"
        
    def send_whatsapp_message(self, phone, message, appointment_id=None):
        """
        Envia mensagem via WhatsApp usando n8n + Evolution API
        """
        try:
            # Preparar dados para o webhook do n8n
            payload = {
                "phone": self._format_phone(phone),
                "message": message,
                "appointment_id": appointment_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Enviar para n8n webhook
            response = requests.post(
                self.n8n_webhook_url,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"Notificação enviada com sucesso para {phone}")
                return True
            else:
                print(f"Erro ao enviar notificação: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Erro ao enviar notificação WhatsApp: {str(e)}")
            return False
    
    def send_appointment_confirmation(self, appointment_id):
        """
        Envia confirmação de agendamento para cliente e profissional
        """
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return False
            
            # Mensagem para o cliente
            client_message = self._get_client_confirmation_message(appointment)
            client_sent = self.send_whatsapp_message(
                appointment.client_phone, 
                client_message, 
                appointment_id
            )
            
            # Mensagem para o profissional
            professional_message = self._get_professional_notification_message(appointment)
            professional_sent = self.send_whatsapp_message(
                appointment.professional.phone, 
                professional_message, 
                appointment_id
            )
            
            # Atualizar status de notificação
            if client_sent:
                appointment.notification_sent = True
                db.session.commit()
            
            return client_sent and professional_sent
            
        except Exception as e:
            print(f"Erro ao enviar confirmação de agendamento: {str(e)}")
            return False
    
    def send_appointment_reminder(self, appointment_id):
        """
        Envia lembrete de agendamento
        """
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return False
            
            reminder_message = self._get_reminder_message(appointment)
            sent = self.send_whatsapp_message(
                appointment.client_phone, 
                reminder_message, 
                appointment_id
            )
            
            if sent:
                appointment.reminder_sent = True
                db.session.commit()
            
            return sent
            
        except Exception as e:
            print(f"Erro ao enviar lembrete: {str(e)}")
            return False
    
    def send_appointment_cancellation(self, appointment_id, reason=""):
        """
        Envia notificação de cancelamento
        """
        try:
            appointment = Appointment.query.get(appointment_id)
            if not appointment:
                return False
            
            cancellation_message = self._get_cancellation_message(appointment, reason)
            
            # Enviar para cliente
            client_sent = self.send_whatsapp_message(
                appointment.client_phone, 
                cancellation_message, 
                appointment_id
            )
            
            # Enviar para profissional
            professional_sent = self.send_whatsapp_message(
                appointment.professional.phone, 
                f"Agendamento cancelado: {appointment.client_name} - {appointment.appointment_date} {appointment.appointment_time}", 
                appointment_id
            )
            
            return client_sent and professional_sent
            
        except Exception as e:
            print(f"Erro ao enviar cancelamento: {str(e)}")
            return False
    
    def _format_phone(self, phone):
        """
        Formata o telefone para o padrão internacional
        """
        # Remove caracteres não numéricos
        clean_phone = ''.join(filter(str.isdigit, phone))
        
        # Adiciona código do país se necessário (Brasil = 55)
        if len(clean_phone) == 11 and clean_phone.startswith('11'):
            return f"55{clean_phone}"
        elif len(clean_phone) == 10:
            return f"5511{clean_phone}"
        elif len(clean_phone) == 11:
            return f"55{clean_phone}"
        else:
            return clean_phone
    
    def _get_client_confirmation_message(self, appointment):
        """
        Gera mensagem de confirmação para o cliente
        """
        service_name = appointment.service.name if appointment.service else "Serviço"
        date_formatted = appointment.appointment_date.strftime('%d/%m/%Y')
        
        message = f"""🗓️ *Agendamento Confirmado!*

Olá {appointment.client_name}!

Seu agendamento foi confirmado com sucesso:

👨‍⚕️ *Profissional:* {appointment.professional.name}
🛠️ *Serviço:* {service_name}
📅 *Data:* {date_formatted}
⏰ *Horário:* {appointment.appointment_time.strftime('%H:%M')}

📍 *Local:* {appointment.professional.address or 'A definir'}

📞 *Contato do profissional:* {appointment.professional.phone}

⚠️ *Importante:* Chegue com 10 minutos de antecedência.

Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.

Obrigado por escolher nossos serviços! 😊"""

        return message
    
    def _get_professional_notification_message(self, appointment):
        """
        Gera mensagem de notificação para o profissional
        """
        service_name = appointment.service.name if appointment.service else "Serviço"
        date_formatted = appointment.appointment_date.strftime('%d/%m/%Y')
        
        message = f"""📋 *Novo Agendamento!*

Você tem um novo agendamento:

👤 *Cliente:* {appointment.client_name}
📞 *Telefone:* {appointment.client_phone}
🛠️ *Serviço:* {service_name}
📅 *Data:* {date_formatted}
⏰ *Horário:* {appointment.appointment_time.strftime('%H:%M')}

📧 *Email:* {appointment.client_email or 'Não informado'}
📍 *Endereço do cliente:* {appointment.client_address or 'Não informado'}

💬 *Observações:* {appointment.notes or 'Nenhuma observação'}

Acesse seu painel para gerenciar este agendamento."""

        return message
    
    def _get_reminder_message(self, appointment):
        """
        Gera mensagem de lembrete
        """
        service_name = appointment.service.name if appointment.service else "Serviço"
        date_formatted = appointment.appointment_date.strftime('%d/%m/%Y')
        
        message = f"""⏰ *Lembrete de Agendamento*

Olá {appointment.client_name}!

Lembramos que você tem um agendamento amanhã:

👨‍⚕️ *Profissional:* {appointment.professional.name}
🛠️ *Serviço:* {service_name}
📅 *Data:* {date_formatted}
⏰ *Horário:* {appointment.appointment_time.strftime('%H:%M')}

📍 *Local:* {appointment.professional.address or 'A definir'}

Não esqueça! Chegue com 10 minutos de antecedência.

📞 *Contato:* {appointment.professional.phone}"""

        return message
    
    def _get_cancellation_message(self, appointment, reason=""):
        """
        Gera mensagem de cancelamento
        """
        service_name = appointment.service.name if appointment.service else "Serviço"
        date_formatted = appointment.appointment_date.strftime('%d/%m/%Y')
        
        message = f"""❌ *Agendamento Cancelado*

Olá {appointment.client_name},

Informamos que seu agendamento foi cancelado:

👨‍⚕️ *Profissional:* {appointment.professional.name}
🛠️ *Serviço:* {service_name}
📅 *Data:* {date_formatted}
⏰ *Horário:* {appointment.appointment_time.strftime('%H:%M')}

{f'*Motivo:* {reason}' if reason else ''}

Para reagendar, acesse nosso site ou entre em contato.

📞 *Contato:* {appointment.professional.phone}

Pedimos desculpas pelo inconveniente."""

        return message

# Instância global do serviço
notification_service = NotificationService()

