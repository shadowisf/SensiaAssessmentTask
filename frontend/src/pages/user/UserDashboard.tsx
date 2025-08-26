import { useEffect, useState } from "react";
import { readSelfUser } from "../../utils/UserCRUD";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import type { AccessLevel } from "../../utils/types";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized } = useAuth();

  const [pages, setPages] = useState<any[]>([]);
  const [accessLevels, setAccessLevels] = useState<Record<number, AccessLevel>>(
    {}
  );
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSelfUser() {
      const { data } = await readSelfUser();

      if (!data || (authInitialized && !isAuthenticated)) {
        navigate("/");
        return;
      }

      setCurrentUser(data);
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

  return (
    <main className="dashboard-wrapper">
      <div className="pages-container">
        <h1>Pages</h1>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="page-gallery">
          {pages.map((page: any) => {
            if (!hasAnyAccess(page.id)) return null;

            const access = accessLevels[page.id];
            const perms = [];
            if (access.can_create) perms.push("Create");
            if (access.can_view) perms.push("View");
            if (access.can_edit) perms.push("Edit");
            if (access.can_delete) perms.push("Delete");

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
      </div>
    </main>
  );
}
