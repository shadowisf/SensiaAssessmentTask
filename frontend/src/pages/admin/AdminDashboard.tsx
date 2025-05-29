import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import { createUser } from "../../utils/UserCRUD";
import Spinner from "../../components/Spinner";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { isAuthenticated, authInitialized } = useAuth();

  const navigate = useNavigate();

  // user persistence
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }
  }, [authInitialized, isAuthenticated]);

  return (
    <>
      {loading && <Spinner />}

      <main className="dashboard-wrapper">
        <div className="user-management-container">
          <h1>User Management</h1>

          <div className="input-container">
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : success ? (
            <SuccessMessage>{success}</SuccessMessage>
          ) : null}

          <button
            onClick={() =>
              createUser({
                email,
                setSuccess,
                setEmail,
                setError,
                setLoading,
              })
            }
          >
            Create
          </button>
        </div>
      </main>
    </>
  );
}
