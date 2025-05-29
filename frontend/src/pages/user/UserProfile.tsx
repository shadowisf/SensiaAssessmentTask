import { useEffect, useState } from "react";
import ErrorMessage from "../../components/ErrorMessage";
import SuccessMessage from "../../components/SuccessMessage";
import { updateUser, readUser } from "../../utils/UserCRUD";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner";

export default function UserProfile() {
  const navigate = useNavigate();

  const { isAuthenticated, authInitialized } = useAuth();

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setLoading,
    });
  }, [authInitialized, isAuthenticated]);

  return (
    <>
      {loading && <Spinner />}

      <main className="user-profile-wrapper">
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
                setLoading,
              })
            }
          >
            Update
          </button>
          <button
            onClick={() =>
              readUser({
                setUsername,
                setFirstName,
                setLastName,
                setError,
                setLoading,
              })
            }
          >
            Refresh
          </button>
        </div>
      </main>
    </>
  );
}
