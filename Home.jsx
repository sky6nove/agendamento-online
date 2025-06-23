import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Users, CheckCircle, Star, ArrowRight } from 'lucide-react'

const Home = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamento Simples",
      description: "Clientes podem agendar sem precisar criar conta. Apenas nome, telefone e pronto!"
    },
    {
      icon: Clock,
      title: "Gestão de Horários",
      description: "Configure seus horários de funcionamento, intervalos e limites de atendimento."
    },
    {
      icon: Users,
      title: "Diretório de Profissionais",
      description: "Seja encontrado por novos clientes através do nosso diretório público."
    },
    {
      icon: CheckCircle,
      title: "Validações Inteligentes",
      description: "Sistema evita conflitos de horários e garante a integridade dos agendamentos."
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      profession: "Cabeleireira",
      text: "Revolucionou meu negócio! Agora meus clientes podem agendar a qualquer hora.",
      rating: 5
    },
    {
      name: "João Santos",
      profession: "Fisioterapeuta",
      text: "Interface muito intuitiva. Meus pacientes adoraram a facilidade para agendar.",
      rating: 5
    },
    {
      name: "Ana Costa",
      profession: "Esteticista",
      text: "O sistema de notificações via WhatsApp é perfeito. Nunca mais perdi um cliente.",
      rating: 5
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Sistema de Agendamento
            <span className="text-blue-600"> Online</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conecte profissionais e clientes de forma simples e eficiente. 
            Agendamentos sem complicação, gestão completa e notificações automáticas.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          
          <Link to="/directory">
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Ver Profissionais
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Por que escolher nosso sistema?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Desenvolvido pensando na simplicidade e eficiência para profissionais e clientes.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gray-100 rounded-2xl p-8 md:p-12">
        <div className="text-center space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Como funciona?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Cadastre-se</h3>
              <p className="text-gray-600">
                Crie sua conta, configure seus serviços e horários de funcionamento.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Receba Agendamentos</h3>
              <p className="text-gray-600">
                Clientes agendam diretamente sem precisar criar conta. Simples assim!
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Gerencie Tudo</h3>
              <p className="text-gray-600">
                Visualize, confirme e gerencie todos os seus agendamentos em um só lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            O que nossos usuários dizem
          </h2>
          <p className="text-lg text-gray-600">
            Profissionais que já transformaram seus negócios
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                <CardDescription>{testimonial.profession}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white rounded-2xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-3xl font-bold">
          Pronto para começar?
        </h2>
        <p className="text-xl opacity-90 max-w-2xl mx-auto">
          Junte-se a centenas de profissionais que já estão usando nosso sistema 
          para gerenciar seus agendamentos de forma eficiente.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Cadastrar-se Gratuitamente
            </Button>
          </Link>
          
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home

