import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import Header from './Header'
import { useAuth } from '../../hooks/useAuth'

const AdminLayout = () => {
  const { logout } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isAdmin={true}
      />
      
      <div className="flex">
        <AdminSidebar 
          onLogout={logout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout