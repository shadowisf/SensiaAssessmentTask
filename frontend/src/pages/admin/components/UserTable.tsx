import { useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";
import SuccessMessage from "../../../components/SuccessMessage";
import Spinner from "../../../components/Spinner";
import { createUser } from "../../../utils/UserCRUD";
import type { AccessLevel } from "../../../utils/types";

export default function UserTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [access, setAccess] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  const [editedAccess, setEditedAccess] = useState<Record<string, AccessLevel>>(
    {}
  );
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
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function getAccessLevelsForUser(userId: number) {
    const userAccess = access.filter((a: any) => a.user === userId);

    // Filter out entries with no permissions
    const filteredAccess = userAccess.filter(
      (a: any) => a.can_create || a.can_view || a.can_edit || a.can_delete
    );

    if (filteredAccess.length === 0) return <p>No access.</p>;

    return (
      <div>
        {filteredAccess.map((a: any) => {
          const perms: string[] = [];
          if (a.can_create) perms.push("create");
          if (a.can_view) perms.push("view");
          if (a.can_edit) perms.push("edit");
          if (a.can_delete) perms.push("delete");

          return (
            <div key={a.id}>
              <span>{a.page_name}:</span> <span>{perms.join(", ")}</span> <br />
            </div>
          );
        })}
      </div>
    );
  }

  const handleCheckboxChange =
    (slug: string, field: keyof (typeof editedAccess)[string]) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedAccess((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug],
          [field]: e.target.checked,
        },
      }));
    };

  async function handleSave() {
    if (!selectedUser) return;

    try {
      await Promise.all(
        Object.entries(editedAccess).map(([slug, permissions]) =>
          fetch(
            `http://localhost:8000/api/updateAccessLevel/${selectedUser.id}/${slug}/`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
              },
              body: JSON.stringify(permissions),
            }
          )
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

    if (error) setCreateError(error);

    setLoading(false);
  }

  // Initialize editedAccess for all pages of selected user
  const initializeEditedAccess = (user: any) => {
    const newAccess: typeof editedAccess = {};
    pages.forEach((page) => {
      const entry = access.find(
        (a) => a.user === user.id && a.page === page.id
      );
      newAccess[page.slug] = {
        can_create: entry?.can_create ?? false,
        can_view: entry?.can_view ?? false,
        can_edit: entry?.can_edit ?? false,
        can_delete: entry?.can_delete ?? false,
      };
    });
    setEditedAccess(newAccess);
  };

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
            <th>Permissions</th>
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
                      initializeEditedAccess(user);
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
                : `Edit Access for ${selectedUser?.full_name}`}
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
                  Confirm
                </button>
              </div>
            ) : (
              pages.map((page) => {
                const current = editedAccess[page.slug] || {
                  can_create: false,
                  can_view: false,
                  can_edit: false,
                  can_delete: false,
                };

                return (
                  <div key={page.id} className="access-row">
                    <label>{page.name}</label>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={current.can_create}
                          onChange={handleCheckboxChange(
                            page.slug,
                            "can_create"
                          )}
                        />
                        Create
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={current.can_view}
                          onChange={handleCheckboxChange(page.slug, "can_view")}
                        />
                        View
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={current.can_edit}
                          onChange={handleCheckboxChange(page.slug, "can_edit")}
                        />
                        Edit
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={current.can_delete}
                          onChange={handleCheckboxChange(
                            page.slug,
                            "can_delete"
                          )}
                        />
                        Delete
                      </label>
                    </div>
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
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
