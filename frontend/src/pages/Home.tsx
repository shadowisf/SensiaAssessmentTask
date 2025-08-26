import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized } = useAuth();

  useEffect(() => {
    if (authInitialized && isAuthenticated) {
      async function fetchUser() {
        const res = await fetch("http://localhost:8000/api/readSelfUser/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role === "admin") navigate("/admin-dashboard");
          else navigate("/user-dashboard");
        }
      }
      fetchUser();
    }
  }, [authInitialized, isAuthenticated, navigate]);

  return (
    <main className="home-wrapper">
      <div className="home-title">
        <h1>DASHBOARD</h1>
        <p>Login as:</p>
      </div>

      <div className="home-buttons">
        <Link to={"/admin-login"}>Super Admin</Link>
        <Link to={"/user-login"}>Regular User</Link>
      </div>
    </main>
  );
}
