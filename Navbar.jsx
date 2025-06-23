import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Calendar, User, LogOut, Home, Users } from 'lucide-react'

const Navbar = ({ professional, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">AgendaOnline</span>
          </Link>

          {/* Menu principal */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Início</span>
            </Link>
            
            <Link 
              to="/directory" 
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Profissionais</span>
            </Link>
          </div>

          {/* Menu do usuário */}
          <div className="flex items-center space-x-4">
            {professional ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{professional.name}</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                
                <Link to="/register">
                  <Button>Cadastrar-se</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

