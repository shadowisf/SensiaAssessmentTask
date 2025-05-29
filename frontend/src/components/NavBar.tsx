import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

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
            <Link to={"/admin-login"}>Admin Login</Link>
            <Link to={"/user-login"}>User Login</Link>
          </>
        )}
      </div>
    </nav>
  );
}
