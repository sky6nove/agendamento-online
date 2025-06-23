from flask import Blueprint, request, jsonify, session
from src.models.professional import db, Professional
from src.models.service import Service
from src.models.appointment import Appointment
from datetime import datetime, date, timedelta
from sqlalchemy import func, extract

reports_bp = Blueprint('reports', __name__)

def require_auth():
    professional_id = session.get('professional_id')
    if not professional_id:
        return None
    return Professional.query.get(professional_id)

@reports_bp.route('/reports/dashboard', methods=['GET'])
def get_dashboard_stats():
    try:
        professional = require_auth()
        if not professional:
            return jsonify({'error': 'Não autenticado'}), 401
        
        # Data atual
        today = date.today()
        start_of_month = today.replace(day=1)
        start_of_week = today - timedelta(days=today.weekday())
        
        # Estatísticas básicas
        total_appointments = Appointment.query.filter_by(
            professional_id=professional.id
        ).count()
        
        appointments_this_month = Appointment.query.filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date >= start_of_month
        ).count()
        
        appointments_this_week = Appointment.query.filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date >= start_of_week
        ).count()
        
        appointments_today = Appointment.query.filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date == today
        ).count()
        
        # Agendamentos por status
        status_stats = db.session.query(
            Appointment.status,
            func.count(Appointment.id).label('count')
        ).filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date >= start_of_month
        ).group_by(Appointment.status).all()
        
        # Serviços mais populares
        popular_services = db.session.query(
            Service.name,
            func.count(Appointment.id).label('count')
        ).join(
            Appointment, Service.id == Appointment.service_id
        ).filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date >= start_of_month
        ).group_by(Service.name).order_by(
            func.count(Appointment.id).desc()
        ).limit(5).all()
        
        # Receita estimada (se os serviços têm preço)
        revenue_query = db.session.query(
            func.sum(Service.price).label('total_revenue')
        ).join(
            Appointment, Service.id == Appointment.service_id
        ).filter(
            Appointment.professional_id == professional.id,
            Appointment.appointment_date >= start_of_month,
            Appointment.status.in_(['confirmado', 'concluido']),
            Service.price.isnot(None)
        ).first()
        
        estimated_revenue = revenue_query.total_revenue if revenue_query.total_revenue else 0
        
        return jsonify({
            'stats': {
                'total_appointments': total_appointments,
                'appointments_this_month': appointments_this_month,
                'appointments_this_week': appointments_this_week,
                'appointments_today': appointments_today,
                'estimated_revenue': float(estimated_revenue) if estimated_revenue else 0
            },
            'status_distribution': [
                {'status': status, 'count': count} 
                for status, count in status_stats
            ],
            'popular_services': [
                {'service': name, 'count': count} 
                for name, count in popular_services
            ]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/appointments', methods=['GET'])
def get_appointments_report():
    try:
        professional = require_auth()
        if not professional:
            return jsonify({'error': 'Não autenticado'}), 401
        
        # Parâmetros de filtro
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        status = request.args.get('status')
        service_id = request.args.get('service_id')
        
        # Query base
        query = Appointment.query.filter_by(professional_id=professional.id)
        
        # Aplicar filtros
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                query = query.filter(Appointment.appointment_date >= start_date_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data inválido para start_date'}), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                query = query.filter(Appointment.appointment_date <= end_date_obj)
            except ValueError:
                return jsonify({'error': 'Formato de data inválido para end_date'}), 400
        
        if status:
            query = query.filter(Appointment.status == status)
        
        if service_id:
            query = query.filter(Appointment.service_id == int(service_id))
        
        # Executar query
        appointments = query.order_by(
            Appointment.appointment_date.desc(),
            Appointment.appointment_time.desc()
        ).all()
        
        # Preparar dados para o relatório
        report_data = []
        for apt in appointments:
            service = Service.query.get(apt.service_id)
            report_data.append({
                'id': apt.id,
                'client_name': apt.client_name,
                'client_phone': apt.client_phone,
                'client_email': apt.client_email,
                'service_name': service.name if service else 'N/A',
                'service_price': service.price if service else 0,
                'appointment_date': apt.appointment_date.isoformat(),
                'appointment_time': apt.appointment_time.strftime('%H:%M'),
                'status': apt.status,
                'created_at': apt.created_at.isoformat(),
                'notes': apt.notes
            })
        
        return jsonify({
            'appointments': report_data,
            'total_count': len(report_data),
            'filters_applied': {
                'start_date': start_date,
                'end_date': end_date,
                'status': status,
                'service_id': service_id
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/revenue', methods=['GET'])
def get_revenue_report():
    try:
        professional = require_auth()
        if not professional:
            return jsonify({'error': 'Não autenticado'}), 401
        
        # Parâmetros
        period = request.args.get('period', 'month')  # month, week, year
        
        if period == 'month':
            # Receita por mês nos últimos 12 meses
            revenue_data = []
            for i in range(12):
                target_date = date.today().replace(day=1) - timedelta(days=i*30)
                start_of_month = target_date.replace(day=1)
                
                if target_date.month == 12:
                    end_of_month = target_date.replace(year=target_date.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    end_of_month = target_date.replace(month=target_date.month + 1, day=1) - timedelta(days=1)
                
                revenue = db.session.query(
                    func.sum(Service.price).label('total')
                ).join(
                    Appointment, Service.id == Appointment.service_id
                ).filter(
                    Appointment.professional_id == professional.id,
                    Appointment.appointment_date >= start_of_month,
                    Appointment.appointment_date <= end_of_month,
                    Appointment.status.in_(['confirmado', 'concluido']),
                    Service.price.isnot(None)
                ).first()
                
                revenue_data.append({
                    'period': start_of_month.strftime('%Y-%m'),
                    'period_label': start_of_month.strftime('%b/%Y'),
                    'revenue': float(revenue.total) if revenue.total else 0
                })
            
            revenue_data.reverse()  # Ordem cronológica
            
        elif period == 'week':
            # Receita por semana nas últimas 8 semanas
            revenue_data = []
            for i in range(8):
                start_of_week = date.today() - timedelta(days=date.today().weekday() + i*7)
                end_of_week = start_of_week + timedelta(days=6)
                
                revenue = db.session.query(
                    func.sum(Service.price).label('total')
                ).join(
                    Appointment, Service.id == Appointment.service_id
                ).filter(
                    Appointment.professional_id == professional.id,
                    Appointment.appointment_date >= start_of_week,
                    Appointment.appointment_date <= end_of_week,
                    Appointment.status.in_(['confirmado', 'concluido']),
                    Service.price.isnot(None)
                ).first()
                
                revenue_data.append({
                    'period': start_of_week.strftime('%Y-W%U'),
                    'period_label': f"{start_of_week.strftime('%d/%m')} - {end_of_week.strftime('%d/%m')}",
                    'revenue': float(revenue.total) if revenue.total else 0
                })
            
            revenue_data.reverse()
            
        else:  # year
            # Receita por ano
            revenue_data = []
            current_year = date.today().year
            
            for year in range(current_year - 2, current_year + 1):
                revenue = db.session.query(
                    func.sum(Service.price).label('total')
                ).join(
                    Appointment, Service.id == Appointment.service_id
                ).filter(
                    Appointment.professional_id == professional.id,
                    extract('year', Appointment.appointment_date) == year,
                    Appointment.status.in_(['confirmado', 'concluido']),
                    Service.price.isnot(None)
                ).first()
                
                revenue_data.append({
                    'period': str(year),
                    'period_label': str(year),
                    'revenue': float(revenue.total) if revenue.total else 0
                })
        
        return jsonify({
            'revenue_data': revenue_data,
            'period': period
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/reports/services-performance', methods=['GET'])
def get_services_performance():
    try:
        professional = require_auth()
        if not professional:
            return jsonify({'error': 'Não autenticado'}), 401
        
        # Período (últimos 30 dias por padrão)
        days = int(request.args.get('days', 30))
        start_date = date.today() - timedelta(days=days)
        
        # Performance por serviço
        services_performance = db.session.query(
            Service.id,
            Service.name,
            Service.price,
            Service.duration_minutes,
            func.count(Appointment.id).label('total_appointments'),
            func.sum(
                func.case(
                    (Appointment.status == 'concluido', 1),
                    else_=0
                )
            ).label('completed_appointments'),
            func.sum(
                func.case(
                    (Appointment.status == 'cancelado', 1),
                    else_=0
                )
            ).label('cancelled_appointments'),
            func.sum(
                func.case(
                    (Appointment.status.in_(['confirmado', 'concluido']), Service.price),
                    else_=0
                )
            ).label('total_revenue')
        ).outerjoin(
            Appointment, Service.id == Appointment.service_id
        ).filter(
            Service.professional_id == professional.id,
            Service.is_active == True
        ).filter(
            db.or_(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date.is_(None)
            )
        ).group_by(
            Service.id, Service.name, Service.price, Service.duration_minutes
        ).all()
        
        performance_data = []
        for service in services_performance:
            total = service.total_appointments or 0
            completed = service.completed_appointments or 0
            cancelled = service.cancelled_appointments or 0
            revenue = service.total_revenue or 0
            
            completion_rate = (completed / total * 100) if total > 0 else 0
            cancellation_rate = (cancelled / total * 100) if total > 0 else 0
            
            performance_data.append({
                'service_id': service.id,
                'service_name': service.name,
                'service_price': float(service.price) if service.price else 0,
                'duration_minutes': service.duration_minutes,
                'total_appointments': total,
                'completed_appointments': completed,
                'cancelled_appointments': cancelled,
                'completion_rate': round(completion_rate, 2),
                'cancellation_rate': round(cancellation_rate, 2),
                'total_revenue': float(revenue),
                'avg_revenue_per_appointment': round(float(revenue) / total, 2) if total > 0 else 0
            })
        
        return jsonify({
            'services_performance': performance_data,
            'period_days': days,
            'start_date': start_date.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

