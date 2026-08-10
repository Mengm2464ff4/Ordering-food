import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from '../../hooks/useAuth'

const MainLayout = () => {
  const { user, logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex flex-1">
        <Sidebar 
          user={user} 
          onLogout={logout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1">
          <Outlet />  {/* ← This renders the matched route */}
        </main>
      </div>
      
      <Footer />
    </div>
  )
}

export default MainLayout