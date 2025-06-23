import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle } from 'lucide-react'

const ClientBooking = () => {
  const { professionalId } = useParams()
  const navigate = useNavigate()
  
  const [professional, setProfessional] = useState(null)
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [availableTimes, setAvailableTimes] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProfessionalData()
  }, [professionalId])

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailability()
    }
  }, [selectedService, selectedDate])

  const fetchProfessionalData = async () => {
    try {
      // Buscar dados do profissional
      const profResponse = await fetch(`http://localhost:5000/api/professionals/directory`)
      const profData = await profResponse.json()
      
      const prof = profData.professionals.find(p => p.id === parseInt(professionalId))
      if (!prof) {
        setError('Profissional não encontrado')
        return
      }
      
      setProfessional(prof)
      setServices(prof.services || [])
      
    } catch (error) {
      setError('Erro ao carregar dados do profissional')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailability = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/professionals/${professionalId}/availability?date=${selectedDate}&service_id=${selectedService}`
      )
      const data = await response.json()
      
      if (response.ok) {
        setAvailableTimes(data.available_times)
      } else {
        setAvailableTimes([])
      }
    } catch (error) {
      setAvailableTimes([])
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBookingLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: parseInt(professionalId),
          service_id: parseInt(selectedService),
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        setError(data.error || 'Erro ao realizar agendamento')
      }
    } catch (error) {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setBookingLoading(false)
    }
  }

  // Gerar próximos 30 dias
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !professional) {
    return (
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-red-600">Erro</h1>
        <p>{error}</p>
        <Button onClick={() => navigate('/directory')}>
          Voltar ao Diretório
        </Button>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6">
        <Card>
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Agendamento Confirmado!
            </CardTitle>
            <CardDescription>
              Seu agendamento foi realizado com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-left space-y-2">
              <p><strong>Profissional:</strong> {professional.name}</p>
              <p><strong>Data:</strong> {new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {selectedTime}</p>
              <p><strong>Serviço:</strong> {services.find(s => s.id === parseInt(selectedService))?.name}</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={() => navigate('/directory')} className="w-full">
                Voltar ao Diretório
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Fazer Novo Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const selectedServiceData = services.find(s => s.id === parseInt(selectedService))

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{professional.name}</span>
          </CardTitle>
          {professional.description && (
            <CardDescription>{professional.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {professional.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <span>{professional.phone}</span>
            </div>
          )}
          {professional.address && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{professional.address}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agendar Horário</span>
          </CardTitle>
          <CardDescription>
            Preencha os dados abaixo para realizar seu agendamento
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Service Selection */}
            <div className="space-y-2">
              <Label>Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name} - {service.duration_minutes}min
                      {service.price && ` - R$ ${service.price.toFixed(2)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Data *</Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma data" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDates().map((date) => (
                    <SelectItem key={date} value={date}>
                      {new Date(date).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            {selectedDate && selectedService && (
              <div className="space-y-2">
                <Label>Horário *</Label>
                {availableTimes.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Nenhum horário disponível para esta data
                  </p>
                ) : (
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Client Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Seus Dados</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_name">Nome Completo *</Label>
                  <Input
                    id="client_name"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="client_phone">Telefone *</Label>
                  <Input
                    id="client_phone"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  name="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={handleInputChange}
                />
              </div>
              
              {selectedServiceData?.requires_address && (
                <div className="space-y-2">
                  <Label htmlFor="client_address">Endereço *</Label>
                  <Input
                    id="client_address"
                    name="client_address"
                    value={formData.client_address}
                    onChange={handleInputChange}
                    required={selectedServiceData?.requires_address}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={bookingLoading || !selectedService || !selectedDate || !selectedTime}
            >
              {bookingLoading ? 'Agendando...' : 'Confirmar Agendamento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClientBooking

