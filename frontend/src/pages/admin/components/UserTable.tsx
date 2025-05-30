import { useEffect, useState } from "react";
import ErrorMessage from "../../../components/ErrorMessage";

type User = {
  id: number;
  email: string;
  full_name: string;
};

type Page = {
  id: number;
  name: string;
};

type Access = {
  id?: number;
  user: number;
  page: number;
  page_name: string;
  access_level: string;
};

const ACCESS_LEVELS = ["all", "view", "edit", "delete", "none"];

export default function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [access, setAccess] = useState<Access[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAccess, setEditingAccess] = useState<Access[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [userRes, accessRes, pageRes] = await Promise.all([
          fetch("http://localhost:8000/api/readAllUsers/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
          fetch("http://localhost:8000/api/readAllPageAccess/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
          fetch("http://localhost:8000/api/readAllPages/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
        ]);

        if (!userRes.ok || !accessRes.ok || !pageRes.ok)
          throw new Error("Failed to fetch data");

        const [userData, accessData, pageData] = await Promise.all([
          userRes.json(),
          accessRes.json(),
          pageRes.json(),
        ]);

        setUsers(userData);
        setAccess(accessData);
        setPages(pageData);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchAllData();
  }, []);

  const getAccessLevelsForUser = (userId: number) => {
    const userAccessEntries = access.filter((entry) => entry.user === userId);
    if (userAccessEntries.length === 0) return "No Access";
    return userAccessEntries
      .map((entry) => `${entry.page_name}: ${entry.access_level}`)
      .join(", ");
  };

  const openDrawer = (user: User) => {
    setSelectedUser(user);

    const mappedAccess: Access[] = pages.map((page) => {
      const found = access.find(
        (entry) => entry.user === user.id && entry.page === page.id
      );

      return {
        id: found?.id,
        user: user.id,
        page: page.id,
        page_name: page.name,
        access_level: found?.access_level || "none",
      };
    });

    setEditingAccess(mappedAccess);
    setDrawerOpen(true);
  };

  const updateAccessLevel = (pageId: number, newLevel: string) => {
    setEditingAccess((prev) =>
      prev.map((entry) =>
        entry.page === pageId ? { ...entry, access_level: newLevel } : entry
      )
    );
  };

  const handleSave = async () => {
    try {
      await Promise.all(
        editingAccess.map((entry) => {
          if (entry.access_level === "none" && entry.id) {
            // Optional: delete access entry
            return fetch(
              `http://localhost:8000/api/updateUserAccess/${entry.id}/`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
              }
            );
          }

          return fetch(
            `http://localhost:8000/api/updateUserAccess/${entry.id ?? ""}`,
            {
              method: entry.id ? "PUT" : "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("access")}`,
              },
              body: JSON.stringify({
                user: entry.user,
                page: entry.page,
                access_level: entry.access_level,
              }),
            }
          );
        })
      );

      setAccess((prev) => {
        const updatedMap = new Map(
          editingAccess
            .filter((e) => e.access_level !== "none")
            .map((e) => [`${e.user}-${e.page}`, e])
        );

        const merged = [
          ...prev.filter(
            (entry) => !updatedMap.has(`${entry.user}-${entry.page}`)
          ),
          ...Array.from(updatedMap.values()),
        ];

        return merged;
      });

      setDrawerOpen(false);
    } catch (err) {
      alert("Failed to save changes");
    }
  };

  return (
    <div className="user-table-container">
      <h1>User Table</h1>
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <table className="user-table">
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
                  <button onClick={() => openDrawer(user)}>Edit</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {drawerOpen && selectedUser && (
        <div className="drawer">
          <div className="drawer-header">
            <h2>Edit Access: {selectedUser.full_name}</h2>
            <button onClick={() => setDrawerOpen(false)}>✕</button>
          </div>

          <div className="drawer-body">
            {editingAccess.map((entry) => (
              <div key={entry.page} className="access-row">
                <label>{entry.page_name}</label>
                <select
                  value={entry.access_level}
                  onChange={(e) =>
                    updateAccessLevel(entry.page, e.target.value)
                  }
                >
                  {ACCESS_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="drawer-footer">
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setDrawerOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
