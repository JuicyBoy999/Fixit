import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './components/auth/AdminLogin';
import RequestPasswordReset from './pages/RequestPasswordReset';
import ResetPassword from './pages/ResetPassword';
import RepairHistory from './pages/RepairHistory';
import BookRepair from './pages/BookRepair';
import TechnicianDirectory from './pages/TechnicianDirectory';
import TechnicianProfile from './pages/TechnicianProfile';
import RepairRequestDetails from './pages/RepairRequestDetails';

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
          <Route path="/book-repair" element={<BookRepair />} />
          <Route path="/repair-history" element={<RepairHistory />} />
          <Route path="/technicians" element={<TechnicianDirectory />} />
          <Route path="/technicians/repair-requests/:id" element={<RepairRequestDetails />} />
          <Route path="/technicians/:id" element={<TechnicianProfile />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
