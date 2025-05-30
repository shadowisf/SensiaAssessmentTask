import { useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [access, setAccess] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [editedAccess, setEditedAccess] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const token = localStorage.getItem("access");
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [userRes, accessRes, pagesRes] = await Promise.all([
        fetch("http://localhost:8000/api/readAllUsers/", { headers }),
        fetch("http://localhost:8000/api/readAllPageAccess/", { headers }),
        fetch("http://localhost:8000/api/readAllPages/", { headers }),
      ]);

      if (!userRes.ok) throw new Error("Failed to fetch users");
      if (!accessRes.ok) throw new Error("Failed to fetch access levels");
      if (!pagesRes.ok) throw new Error("Failed to fetch pages");

      const [userData, accessData, pagesData] = await Promise.all([
        userRes.json(),
        accessRes.json(),
        pagesRes.json(),
      ]);

      setUsers(userData);
      setAccess(accessData);
      setPages(pagesData);
    } catch (error) {
      setError((error as Error).message);
    }
  }

  function getAccessLevelsForUser(userId: number) {
    const userAccess = access.filter((a: any) => a.user === userId);

    return (
      <ul>
        {userAccess.map((a: any, idx: number) => (
          <li
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "1rem",
            }}
          >
            <span>{a.page_name}:</span> <span>{a.access_level}</span>
          </li>
        ))}
      </ul>
    );
  }

  async function handleUpdateAccessLevel(
    email: string,
    slug: string,
    newAccessLevel: string
  ) {
    const res = await fetch(
      `http://localhost:8000/api/updateAccessLevel/${email}/${slug}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify({ access_level: newAccessLevel }),
      }
    );

    if (!res.ok) throw new Error("Failed to update access level");

    fetchAllData();
  }

  function handleChange(slug: string, newLevel: string) {
    setEditedAccess((prev) => ({ ...prev, [slug]: newLevel }));
  }

  async function handleSave() {
    if (!selectedUser) return;

    try {
      const updates = Object.entries(editedAccess);
      for (const [slug, level] of updates) {
        await handleUpdateAccessLevel(selectedUser.email, slug, level);
      }

      setEditedAccess({});
    } catch (err) {
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
    }
  }

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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={5}>No users found.</td>
            </tr>
          ) : (
            users.map((user: any) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{getAccessLevelsForUser(user.id)}</td>
                <td>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setDrawerOpen(true);
                      setEditedAccess({});
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {drawerOpen && selectedUser && (
        <div className="drawer">
          <div className="drawer-header">
            <h2>Edit Access for {selectedUser.full_name}</h2>
            <button onClick={() => setDrawerOpen(false)}>Close</button>
          </div>
          <div className="drawer-body">
            {pages.map((page: any) => {
              const entry = access.find(
                (a: any) => a.user === selectedUser.id && a.page === page.id
              );
              const current =
                editedAccess[page.slug] ??
                (entry ? entry.access_level : "none");

              return (
                <div key={page.id} className="access-row">
                  <label>{page.name}</label>
                  <select
                    value={current}
                    onChange={(e) => handleChange(page.slug, e.target.value)}
                  >
                    <option value="all">all</option>
                    <option value="view">view</option>
                    <option value="edit">edit</option>
                    <option value="delete">delete</option>
                    <option value="none">none</option>
                  </select>
                </div>
              );
            })}

            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleSave}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
