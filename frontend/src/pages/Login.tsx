import { useState } from "react";
import ErrorMessage from "../components/ErrorMessage";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type LoginProps = {
  userRole: string;
};

export default function Login({ userRole }: LoginProps) {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin() {
    try {
      const response = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      login(data.access, data.refresh);

      navigate("/dashboard");
    } catch (err) {
      setError("Login failed");
      console.error(err);
    }
  }

  return (
    <main className="login-wrapper">
      <div>
        <h1>{userRole.toLocaleUpperCase()} LOGIN</h1>
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </div>

      <button onClick={handleLogin}>Login</button>
    </main>
  );
}
