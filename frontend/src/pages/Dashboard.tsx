import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import { createUser, readUser, updateUser } from "../utils/Dashboard";

export default function Dashboard() {
  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { isAuthenticated, user, authInitialized } = useAuth();

  const navigate = useNavigate();

  // user persistence
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }

    readUser({
      setUsername,
      setFirstName,
      setLastName,
      setError,
    });
  }, [authInitialized, isAuthenticated]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <main className="dashboard-wrapper">
      {user?.user_id === 1 ? (
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
              createUser({ email, setSuccess, setEmail, setError })
            }
          >
            Create
          </button>
        </div>
      ) : (
        <div className="user-profile-container">
          <h1>User Profile</h1>

          <div className="input-container">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <br />

            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <br />

            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : success ? (
            <SuccessMessage>{success}</SuccessMessage>
          ) : null}

          <div className="button-container">
            <button
              onClick={() =>
                updateUser({
                  username,
                  firstName,
                  lastName,
                  setSuccess,
                  setError,
                })
              }
            >
              Update
            </button>
            <button
              onClick={() =>
                readUser({ setUsername, setFirstName, setLastName, setError })
              }
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
