import { useState } from "react";
import ErrorMessage from "../../components/ErrorMessage";
import Spinner from "../../components/Spinner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { readUser } from "../../utils/UserCRUD";

export default function AdminLogin() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      login(data.access, data.refresh);

      navigate("/admin-dashboard");
    } catch (err) {
      const msg = (err as Error).message;

      console.error(msg);

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <Spinner />}

      <main className="login-wrapper">
        <div>
          <h1>SUPER ADMIN LOGIN</h1>
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </div>

        <button onClick={handleLogin}>Login</button>
      </main>
    </>
  );
}
