import { useEffect, useState } from "react";
import { readSelfUser } from "../../utils/UserCRUD";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";

import SuccessMessage from "../../components/SuccessMessage";
import type { AccessLevel } from "../../utils/types";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized } = useAuth();

  const [pages, setPages] = useState<any[]>([]);
  const [accessLevels, setAccessLevels] = useState<Record<number, AccessLevel>>(
    {}
  );
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [newFullName, setNewFullName] = useState("");

  useEffect(() => {
    async function fetchSelfUser() {
      const { data } = await readSelfUser();

      if (!data || (authInitialized && !isAuthenticated)) {
        navigate("/");
        return;
      }

      setCurrentUser(data);
      setNewFullName(data.full_name || "");
    }

    fetchSelfUser();
  }, [authInitialized, isAuthenticated]);

  // Fetch pages and access levels
  useEffect(() => {
    async function fetchData() {
      try {
        if (!currentUser) return;

        const token = localStorage.getItem("access");
        const headers = { Authorization: `Bearer ${token}` };

        const [pagesRes, accessRes] = await Promise.all([
          fetch("http://localhost:8000/api/readAllPages/", { headers }),
          fetch("http://localhost:8000/api/readAllPageAccess/", { headers }),
        ]);

        if (!pagesRes.ok || !accessRes.ok) {
          throw new Error("Failed to fetch pages or access levels");
        }

        const [pagesData, accessData] = await Promise.all([
          pagesRes.json(),
          accessRes.json(),
        ]);
        setPages(pagesData);

        const newAccessLevels: typeof accessLevels = {};

        pagesData.forEach((page: any) => {
          const entry = accessData.find(
            (a: any) => a.user === currentUser.id && a.page === page.id
          );
          newAccessLevels[page.id] = {
            can_create: entry?.can_create ?? false,
            can_view: entry?.can_view ?? false,
            can_edit: entry?.can_edit ?? false,
            can_delete: entry?.can_delete ?? false,
          };
        });

        setAccessLevels(newAccessLevels);
      } catch (err) {
        const msg = (err as Error).message;
        console.error(msg);
        setError(msg);
      }
    }

    fetchData();
  }, [currentUser]);

  function hasAnyAccess(pageId: number) {
    const access = accessLevels[pageId];
    if (!access) return false;
    return (
      access.can_create ||
      access.can_view ||
      access.can_edit ||
      access.can_delete
    );
  }

  async function handleUpdateFullName() {
    if (!newFullName.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const token = localStorage.getItem("access");

      const res = await fetch("http://localhost:8000/api/updateFullName/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: newFullName }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Failed to update full name.");
      }

      const data = await res.json();
      setSuccess(data.message);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <>
      <main className="dashboard-wrapper">
        <div className="user-profile-container">
          <h1>User Profile</h1>

          <div className="input-container">
            <label>Full name</label>
            <input
              type="text"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
            />
          </div>

          {error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : success ? (
            <SuccessMessage>{success}</SuccessMessage>
          ) : null}

          <button onClick={handleUpdateFullName}>Update</button>
        </div>

        <div className="pages-container">
          <h1>Pages</h1>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="page-gallery">
            {pages
              .filter((page) => page && hasAnyAccess(page.id))
              .map((page: any) => {
                const access = accessLevels[page.id];
                const perms = [];
                if (access.can_create) perms.push("create");
                if (access.can_view) perms.push("view");
                if (access.can_edit) perms.push("edit");
                if (access.can_delete) perms.push("delete");

                return (
                  <div className="page" key={page.id}>
                    <Link to={`/page/${page.slug}`}>
                      {page.name}
                      <small>Access: {perms.join(", ")}</small>
                    </Link>
                  </div>
                );
              })}
          </div>

          {pages.filter((page) => page && hasAnyAccess(page.id)).length ===
            0 && <p>No pages have been assigned to you yet.</p>}
        </div>
      </main>
    </>
  );
}
