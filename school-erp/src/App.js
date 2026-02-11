import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Students from "./pages/Students"
import ExtraFees from "./pages/ExtraFees"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import "./styles/main.css"
import "./styles/login-nextgen.css"
import "./styles/animations.css"
import { isAuthenticated } from "./hooks/useAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/extra-fees" element={<ProtectedRoute><ExtraFees /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/" element={<LoginCheck />} />
        <Route path="*" element={<LoginCheck />} />
      </Routes>
    </BrowserRouter>
  )
}



function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}


function LoginCheck() {
  const token = localStorage.getItem("token")
  return <Navigate to={token ? "/dashboard" : "/login"} replace />
}

export default App