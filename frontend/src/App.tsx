import { Routes, Route } from "react-router-dom";
import "./main.scss";
import Home from "./pages/Home";
import NavBar from "./components/NavBar";
import AdminLogin from "./pages/admin/AdminLogin";
import UserLogin from "./pages/user/UserLogin";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Routes>
    </>
  );
}
