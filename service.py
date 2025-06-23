from src.models.professional import db
from datetime import datetime

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    duration_minutes = db.Column(db.Integer, nullable=False)  # Duração em minutos
    price = db.Column(db.Float)
    is_active = db.Column(db.Boolean, default=True)
    requires_address = db.Column(db.Boolean, default=False)  # Se o serviço requer endereço do cliente
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    appointments = db.relationship('Appointment', backref='service', lazy=True)

    def __repr__(self):
        return f'<Service {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'professional_id': self.professional_id,
            'name': self.name,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'price': self.price,
            'is_active': self.is_active,
            'requires_address': self.requires_address,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

