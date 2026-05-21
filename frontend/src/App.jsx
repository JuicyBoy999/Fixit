import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import BookRepair from './pages/BookRepair'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/book" element={<BookRepair />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
