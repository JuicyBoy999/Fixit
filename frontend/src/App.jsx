import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import BookRepair from './pages/BookRepair';
import BrowseTechnicians from './pages/BrowseTechnicians';
import TechnicianCalendar from './pages/TechnicianCalendar';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './components/auth/AdminLogin';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import CancelBooking from './pages/CancelBooking'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book" element={<BookRepair />} />
          <Route path="/technicians" element={<BrowseTechnicians />} />
          <Route path="/calendar" element={<TechnicianCalendar />} />
          <Route path="/cancel-booking" element={<CancelBooking />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;