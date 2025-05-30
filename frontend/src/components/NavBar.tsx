import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function NavBar() {
  const navigate = useNavigate();

  const { isAuthenticated, logout } = useAuth();

  const [user, setUser] = useState<any | null>(null);

  function handleLogout() {
    logout();
    navigate("/");
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSelfUser() {
      try {
        const res = await fetch("http://localhost:8000/api/readSelfUser/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        const msg = (err as Error).message;
        console.error(msg);
        setUser(null);
      }
    }

    if (isAuthenticated) {
      fetchSelfUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  return (
    <nav>
      <Link
        to={
          user?.role === "admin"
            ? "/admin-dashboard"
            : user?.role === "user"
            ? "/user-dashboard"
            : "/"
        }
      >
        SVG
      </Link>

      <div className="right-container">
        {isAuthenticated ? (
          <a onClick={handleLogout}>Logout</a>
        ) : (
          <>
            <Link to={"/admin-login"}>Super Admin Login</Link>
            <Link to={"/user-login"}>Regular User Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
