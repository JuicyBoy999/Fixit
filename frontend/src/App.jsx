import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
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
import CancelBooking from './pages/CancelBooking';
import RescheduleBooking from './pages/RescheduleBooking';
import Notifications from './pages/Notifications';
import AppointmentReminder from './pages/AppointmentReminder';
import BookingConfirmationStatus from './pages/BookingConfirmationStatus';
import ServiceArea from './pages/ServiceArea';
import SetAvailability from './pages/SetAvailability';
import TechnicianDashboard from './pages/TechnicianDashboard';
import RepairRequests from './pages/RepairRequests';
import TechnicianDirectory from './pages/TechnicianDirectory';
import TechnicianProfile from './pages/TechnicianProfile';
import RepairRequestDetails from './pages/RepairRequestDetails';
import AdminPanel from './pages/AdminPanel';
import Chat from './pages/Chat';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/forgot-password" element={<RequestPasswordReset />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/book-repair" element={<BookRepair />} />
          <Route path="/book" element={<BookRepair />} />
          <Route path="/browse-technicians" element={<BrowseTechnicians />} />
          <Route path="/calendar" element={<TechnicianCalendar />} />
          <Route path="/cancel-booking" element={<CancelBooking />} />
          <Route path="/reschedule-booking" element={<RescheduleBooking />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/appointment-reminder" element={<AppointmentReminder />} />
          <Route path="/booking-status" element={<BookingConfirmationStatus />} />
          <Route path="/service-area" element={<ServiceArea />} />
          <Route path="/availability" element={<SetAvailability />} />
          <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
          <Route path="/repair-requests" element={<RepairRequests />} />
          <Route path="/technicians" element={<TechnicianDirectory />} />
          <Route path="/technicians/repair-requests/:id" element={<RepairRequestDetails />} />
          <Route path="/technicians/:id" element={<TechnicianProfile />} />
          <Route path="/chat/:repairId" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
