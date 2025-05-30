import { useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";

export default function UserTable() {
  const [users, setUsers] = useState([]);

  const [error, setError] = useState("");

  // fetch all users
  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const res = await fetch("http://localhost:8000/api/readAllUsers/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        const msg = (error as Error).message;

        setError(msg);
      }
    }

    fetchAllUsers();
  }, []);

  return (
    <div className="user-table-container">
      <h1>User Table</h1>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Access Level</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan={4}>No users found.</td>
            </tr>
          )}
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.full_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
