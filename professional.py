from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Professional(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    address = db.Column(db.String(255))
    is_public = db.Column(db.Boolean, default=True)  # Agenda pública ou privada
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    services = db.relationship('Service', backref='professional', lazy=True, cascade='all, delete-orphan')
    schedules = db.relationship('Schedule', backref='professional', lazy=True, cascade='all, delete-orphan')
    appointments = db.relationship('Appointment', backref='professional', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f'<Professional {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'description': self.description,
            'address': self.address,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

