import { useEffect, useState } from "react";

export default function UserPageAccessTable() {
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [usersRes, pagesRes, accessRes] = await Promise.all([
          fetch("http://localhost:8000/api/readAllUsers/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
          fetch("http://localhost:8000/api/readAllPages/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
          fetch("http://localhost:8000/api/userPageAccess/", {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
          }),
        ]);

        if (!usersRes.ok) throw new Error("Failed to fetch users");
        if (!pagesRes.ok) throw new Error("Failed to fetch pages");
        if (!accessRes.ok) throw new Error("Failed to fetch access data");

        const usersData = await usersRes.json();
        const pagesData = await pagesRes.json();
        const accessData = await accessRes.json();

        setUsers(usersData);
        setPages(pagesData);
        setAccessList(accessData);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    fetchAll();
  }, []);

  // Build a map of access: userId -> pageId -> access_level
  const accessMap: Record<number, Record<number, string>> = {};
  accessList.forEach(({ user, page, access_level }) => {
    if (!accessMap[user]) accessMap[user] = {};
    accessMap[user][page] = access_level;
  });

  return (
    <div>
      <h1>User Access Levels</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>User</th>
            {pages.map((page: any) => (
              <th key={page.id}>{page.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user: any) => (
            <tr key={user.id}>
              <td>{user.full_name || user.email}</td>
              {pages.map((page: any) => (
                <td key={page.id}>{accessMap[user.id]?.[page.id] || "none"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
