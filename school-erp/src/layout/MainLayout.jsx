import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import { logout } from "../hooks/useAuth"

export default function MainLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleNavigation = (path) => {
    navigate(path)
  }

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout()
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        currentPath={location.pathname}
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className={`main-content ${sidebarOpen ? "" : "expanded"}`}>
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  )
}