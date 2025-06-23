from src.models.professional import db
from datetime import datetime

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)
    
    # Dados do cliente (sem necessidade de conta)
    client_name = db.Column(db.String(100), nullable=False)
    client_phone = db.Column(db.String(20), nullable=False)
    client_email = db.Column(db.String(120))
    client_address = db.Column(db.String(255))  # Opcional, dependendo do serviço
    
    # Dados do agendamento
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), default='agendado')  # agendado, confirmado, cancelado, concluido
    notes = db.Column(db.Text)  # Observações adicionais
    
    # Controle
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Notificações
    notification_sent = db.Column(db.Boolean, default=False)
    reminder_sent = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Appointment {self.client_name} - {self.appointment_date} {self.appointment_time}>'

    def to_dict(self):
        return {
            'id': self.id,
            'professional_id': self.professional_id,
            'service_id': self.service_id,
            'client_name': self.client_name,
            'client_phone': self.client_phone,
            'client_email': self.client_email,
            'client_address': self.client_address,
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'appointment_time': self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'notification_sent': self.notification_sent,
            'reminder_sent': self.reminder_sent
        }

