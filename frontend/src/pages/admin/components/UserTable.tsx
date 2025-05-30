import { useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import SuccessMessage from "../../../components/SuccessMessage";
import Spinner from "../../../components/Spinner";
import { createUser } from "../../../utils/UserCRUD";

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [access, setAccess] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const [editedAccess, setEditedAccess] = useState<Record<string, string>>({});
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAllData();
  }, []);

  async function fetchAllData() {
    try {
      const token = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, accessRes, pagesRes] = await Promise.all([
        fetch("http://localhost:8000/api/readAllUsers/", { headers }),
        fetch("http://localhost:8000/api/readAllPageAccess/", { headers }),
        fetch("http://localhost:8000/api/readAllPages/", { headers }),
      ]);

      if (!userRes.ok || !accessRes.ok || !pagesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const [userData, accessData, pagesData] = await Promise.all([
        userRes.json(),
        accessRes.json(),
        pagesRes.json(),
      ]);

      setUsers(userData);
      setAccess(accessData);
      setPages(pagesData);
      setError("");
    } catch (error) {
      setError((error as Error).message);
    }
  }

  function getAccessLevelsForUser(userId: number) {
    const userAccess = access.filter((a: any) => a.user === userId);

    if (userAccess.length === 0) {
      return <p>No access.</p>;
    }

    return (
      <ul>
        {userAccess.map((a: any, idx: number) => (
          <li
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingRight: "2rem",
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
  }

  function handleChange(slug: string, newLevel: string) {
    setEditedAccess((prev) => ({ ...prev, [slug]: newLevel }));
  }

  async function handleSave() {
    if (!selectedUser) return;

    try {
      await Promise.all(
        Object.entries(editedAccess).map(([slug, level]) =>
          handleUpdateAccessLevel(selectedUser.email, slug, level)
        )
      );

      setEditedAccess({});
      setDrawerOpen(false);
      fetchAllData();
    } catch (err) {
      const msg = (err as Error).message;

      console.error(msg);
      setError(msg);
    }
  }

  async function handleCreateUser() {
    setLoading(true);
    setSuccess("");
    setCreateError("");

    const { data, error } = await createUser(newEmail);

    if (data) {
      setSuccess("User created successfully");
      setNewEmail("");
      fetchAllData();
    }

    if (error) {
      setCreateError(error);
    }

    setLoading(false);
  }

  return (
    <div className="user-table-container">
      <h1>User Table</h1>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => {
            setDrawerOpen(true);
            setIsCreateMode(true);
            setSelectedUser(null);
            setEditedAccess({});
            setSuccess("");
            setCreateError("");
          }}
        >
          Create User
        </button>
      </div>

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
            users.map((user) => (
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
                      setIsCreateMode(false);
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

      {drawerOpen && (
        <div className="drawer">
          <div className="drawer-header">
            <h2>
              {isCreateMode
                ? "Create User"
                : `Edit Access for ${selectedUser.full_name}`}
            </h2>
            <button onClick={() => setDrawerOpen(false)}>Close</button>
          </div>

          <div className="drawer-body">
            {isCreateMode ? (
              <div className="user-management-container">
                {loading && <Spinner />}
                <input
                  type="text"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />

                {createError && <ErrorMessage>{createError}</ErrorMessage>}
                {success && <SuccessMessage>{success}</SuccessMessage>}

                <button
                  onClick={handleCreateUser}
                  disabled={!newEmail || loading}
                >
                  Create
                </button>
              </div>
            ) : (
              pages.map((page) => {
                const entry = access.find(
                  (a) => a.user === selectedUser.id && a.page === page.id
                );
                const current =
                  editedAccess[page.slug] ?? entry?.access_level ?? "none";

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
              })
            )}

            {!isCreateMode && (
              <div style={{ marginTop: "1rem" }}>
                <button
                  onClick={handleSave}
                  disabled={Object.keys(editedAccess).length === 0}
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
