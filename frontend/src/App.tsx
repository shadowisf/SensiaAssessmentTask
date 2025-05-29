import { Routes, Route } from "react-router-dom";
import "./main.scss";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<Login userRole="super admin" />} />
        <Route path="/user-login" element={<Login userRole="regular user" />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  );
}
