import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const { isAuthenticated, user, authInitialized } = useAuth();

  // user persistence
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }
  }, [authInitialized, isAuthenticated]);

  async function createUser() {
    try {
      const response = await fetch("http://localhost:8000/api/user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email }),
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="dashboard-wrapper">
      <p>{user?.user_id}</p>

      <div className="user-management-container">
        <h1>User Management</h1>

        <div className="input-container">
          <input type="text" placeholder="Username" />
          <input type="text" placeholder="Email" />
        </div>

        <button onClick={() => {}}>Create</button>
      </div>
    </main>
  );
}
