import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import User from "./pages/User";
import Technician from "./pages/Technician";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/admin" element={<Admin />} />

        <Route path="/user" element={<User />} />

        <Route path="/technician" element={<Technician />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;