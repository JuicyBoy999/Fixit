import { AuthProvider } from './context/AuthContext';
import AdminLogin from './components/auth/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <AdminLogin />
    </AuthProvider>
  );
}
export default App;