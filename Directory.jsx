import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Phone, Mail, Calendar, Star } from 'lucide-react'

const Directory = () => {
  const [professionals, setProfessionals] = useState([])
  const [filteredProfessionals, setFilteredProfessionals] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfessionals()
  }, [])

  useEffect(() => {
    // Filtrar profissionais baseado no termo de busca
    if (searchTerm.trim() === '') {
      setFilteredProfessionals(professionals)
    } else {
      const filtered = professionals.filter(prof => 
        prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.services.some(service => 
          service.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredProfessionals(filtered)
    }
  }, [searchTerm, professionals])

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/professionals/directory')
      const data = await response.json()

      if (response.ok) {
        setProfessionals(data.professionals)
        setFilteredProfessionals(data.professionals)
      } else {
        setError('Erro ao carregar profissionais')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Diretório de Profissionais
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Encontre e agende com profissionais qualificados em sua região
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProfessionals.length === 0 && !error && (
        <div className="text-center space-y-4 py-12">
          <div className="text-gray-400">
            <Calendar className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
          </h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'Tente buscar por outros termos ou navegue por todos os profissionais'
              : 'Seja o primeiro a se cadastrar e aparecer no diretório!'
            }
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
            >
              Ver Todos
            </Button>
          )}
        </div>
      )}

      {/* Professionals Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((professional) => (
          <Card key={professional.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{professional.name}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>4.8 (32 avaliações)</span>
                  </div>
                </div>
              </div>
              
              {professional.description && (
                <CardDescription className="line-clamp-2">
                  {professional.description}
                </CardDescription>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                {professional.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{professional.phone}</span>
                  </div>
                )}
                
                {professional.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{professional.email}</span>
                  </div>
                )}
                
                {professional.address && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="line-clamp-1">{professional.address}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {professional.services && professional.services.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Serviços:</h4>
                  <div className="flex flex-wrap gap-1">
                    {professional.services.slice(0, 3).map((service) => (
                      <Badge key={service.id} variant="secondary" className="text-xs">
                        {service.name}
                        {service.price && ` - R$ ${service.price.toFixed(2)}`}
                      </Badge>
                    ))}
                    {professional.services.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{professional.services.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Link to={`/booking/${professional.id}`} className="block">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Horário
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Results Count */}
      {filteredProfessionals.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          {searchTerm 
            ? `${filteredProfessionals.length} profissional(is) encontrado(s) para "${searchTerm}"`
            : `${filteredProfessionals.length} profissional(is) disponível(is)`
          }
        </div>
      )}
    </div>
  )
}

export default Directory

