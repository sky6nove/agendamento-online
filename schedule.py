from src.models.professional import db
from datetime import datetime, time

class Schedule(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey('professional.id'), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0=Segunda, 1=Terça, ..., 6=Domingo
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    break_start = db.Column(db.Time)  # Início do intervalo (opcional)
    break_end = db.Column(db.Time)    # Fim do intervalo (opcional)
    max_appointments_per_slot = db.Column(db.Integer, default=1)  # Limite de agendamentos por horário
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Schedule {self.day_of_week} {self.start_time}-{self.end_time}>'

    def to_dict(self):
        return {
            'id': self.id,
            'professional_id': self.professional_id,
            'day_of_week': self.day_of_week,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'break_start': self.break_start.strftime('%H:%M') if self.break_start else None,
            'break_end': self.break_end.strftime('%H:%M') if self.break_end else None,
            'max_appointments_per_slot': self.max_appointments_per_slot,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

