import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Workers from './pages/Workers'
import Attendance from './pages/Attendance'
import Advances from './pages/Advances'
import Expenses from './pages/Expenses'
import SalaryReport from './pages/SalaryReport'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/workers" element={<PrivateRoute><Workers /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
           <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
          <Route path="/advances" element={<PrivateRoute><Advances /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
         <Route path="/salary" element={<PrivateRoute><SalaryReport /></PrivateRoute>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App