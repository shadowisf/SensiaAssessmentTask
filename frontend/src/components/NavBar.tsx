import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { isAuthenticated, logout } = useAuth();

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <nav>
      <Link to={isAuthenticated ? "/dashboard" : "/"}>SVG</Link>

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
