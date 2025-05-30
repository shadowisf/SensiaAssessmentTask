import { useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import SuccessMessage from "../../../components/SuccessMessage";
import { createUser } from "../../../utils/UserCRUD";
import Spinner from "../../../components/Spinner";

export default function UserManagement() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleCreateUser() {
    setError("");
    setSuccess("");

    setLoading(true);

    const { data, error } = await createUser(email);

    if (data) {
      setSuccess("User created successfully");
    }

    if (error) {
      setError(error);
    }

    setLoading(false);
  }

  return (
    <>
      {loading && <Spinner />}

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

        <button onClick={handleCreateUser}>Create</button>
      </div>
    </>
  );
}
