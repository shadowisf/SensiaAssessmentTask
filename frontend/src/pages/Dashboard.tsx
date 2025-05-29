import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { generateStrongPassword } from "../utils/generateStrongPassword";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";

export default function Dashboard() {
  const [email, setEmail] = useState("");

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const { isAuthenticated, user, authInitialized } = useAuth();

  // user persistence
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }

    if (user?.user_id !== 1) {
      setUsername(user?.username || "");
      setFirstName(user?.first_name || "");
      setLastName(user?.last_name || "");
    }
  }, [authInitialized, isAuthenticated]);

  async function createUser() {
    try {
      const password = generateStrongPassword();
      const username = email.split("@")[0];

      const response = await fetch("http://localhost:8000/api/createUser/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user");
      }

      const data = await response.json();

      setSuccess(data.message);
      setEmail("");
    } catch (err) {
      console.error(err);

      setError("Failed to create user");
    }
  }

  async function updateUser() {
    try {
      const response = await fetch("http://localhost:8000/api/updateUser/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();

      setSuccess(data.message);
    } catch (err) {
      console.error(err);

      setError("Failed to update user");
    }
  }

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

          <button onClick={createUser}>Create</button>
        </div>
      ) : (
        <div className="user-management-container">
          <h1>User Profile</h1>

          <div className="input-container">
            <label>username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <br />

            <label>first name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <br />

            <label>last name:</label>
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

          <button onClick={updateUser}>Update</button>
        </div>
      )}
    </main>
  );
}
