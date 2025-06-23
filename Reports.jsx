import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Calendar, TrendingUp, Users, DollarSign, Clock, Download } from 'lucide-react'

const Reports = ({ professional }) => {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [servicesPerformance, setServicesPerformance] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (professional) {
      fetchDashboardStats()
      fetchRevenueData()
      fetchServicesPerformance()
    }
  }, [professional, selectedPeriod])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/dashboard', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardStats(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const fetchRevenueData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/reports/revenue?period=${selectedPeriod}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setRevenueData(data.revenue_data)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de receita:', error)
    }
  }

  const fetchServicesPerformance = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reports/services-performance', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setServicesPerformance(data.services_performance)
      }
    } catch (error) {
      console.error('Erro ao carregar performance dos serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'agendado': return '#3b82f6'
      case 'confirmado': return '#10b981'
      case 'cancelado': return '#ef4444'
      case 'concluido': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada dos seus agendamentos e performance
          </p>
        </div>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      {dashboardStats && (
        <div className="grid md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Agendamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.total_appointments}</div>
              <p className="text-xs text-muted-foreground">Desde o início</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.appointments_this_month}</div>
              <p className="text-xs text-muted-foreground">Agendamentos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.appointments_this_week}</div>
              <p className="text-xs text-muted-foreground">Agendamentos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.stats.appointments_today}</div>
              <p className="text-xs text-muted-foreground">Agendamentos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Estimada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {dashboardStats.stats.estimated_revenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Receita por Período</CardTitle>
                <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period_label" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Receita']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        {dashboardStats && dashboardStats.status_distribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Status</CardTitle>
              <CardDescription>Agendamentos por status este mês</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardStats.status_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dashboardStats.status_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Popular Services */}
      {dashboardStats && dashboardStats.popular_services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços Mais Populares</CardTitle>
            <CardDescription>Serviços com mais agendamentos este mês</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardStats.popular_services}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Services Performance */}
      {servicesPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance dos Serviços</CardTitle>
            <CardDescription>Análise detalhada de cada serviço (últimos 30 dias)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servicesPerformance.map((service) => (
                <div key={service.service_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{service.service_name}</h3>
                      <p className="text-sm text-gray-600">
                        {service.duration_minutes} min • R$ {service.service_price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {service.total_revenue.toFixed(2)}
                      </div>
                      <p className="text-xs text-gray-600">Receita total</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{service.total_appointments}</div>
                      <div className="text-gray-600">Total de agendamentos</div>
                    </div>
                    <div>
                      <div className="font-medium text-green-600">{service.completed_appointments}</div>
                      <div className="text-gray-600">Concluídos</div>
                    </div>
                    <div>
                      <div className="font-medium text-red-600">{service.cancelled_appointments}</div>
                      <div className="text-gray-600">Cancelados</div>
                    </div>
                    <div>
                      <div className="font-medium">R$ {service.avg_revenue_per_appointment.toFixed(2)}</div>
                      <div className="text-gray-600">Receita média</div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Badge variant="outline" className="text-green-600">
                      {service.completion_rate}% conclusão
                    </Badge>
                    <Badge variant="outline" className="text-red-600">
                      {service.cancellation_rate}% cancelamento
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Reports

