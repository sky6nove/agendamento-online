import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'

// Páginas
import Home from './pages/Home'
import ProfessionalLogin from './pages/ProfessionalLogin'
import ProfessionalRegister from './pages/ProfessionalRegister'
import ProfessionalDashboard from './pages/ProfessionalDashboard'
import ClientBooking from './pages/ClientBooking'
import Directory from './pages/Directory'

// Componentes
import Navbar from './components/Navbar'

function App() {
  const [professional, setProfessional] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há um profissional logado
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/professionals/profile', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfessional(data.professional)
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/professionals/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setProfessional(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar professional={professional} onLogout={logout} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/booking/:professionalId" element={<ClientBooking />} />
            <Route 
              path="/login" 
              element={<ProfessionalLogin onLogin={setProfessional} />} 
            />
            <Route path="/register" element={<ProfessionalRegister />} />
            <Route 
              path="/dashboard" 
              element={
                professional ? 
                <ProfessionalDashboard professional={professional} /> : 
                <ProfessionalLogin onLogin={setProfessional} />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

