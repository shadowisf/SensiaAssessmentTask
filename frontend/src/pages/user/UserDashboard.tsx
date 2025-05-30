import { useEffect, useState } from "react";
import { readSelfUser } from "../../utils/UserCRUD";
import { Link, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ErrorMessage";
import { useAuth } from "../../context/AuthContext";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, authInitialized } = useAuth();

  const [pages, setPages] = useState<any[]>([]);
  const [accessLevels, setAccessLevels] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSelfUser() {
      const { data } = await readSelfUser();

      if (!data || (authInitialized && !isAuthenticated)) {
        navigate("/");
        return;
      }

      setCurrentUserId(data.id);
    }

    fetchSelfUser();
  }, [authInitialized, isAuthenticated]);

  useEffect(() => {
    async function fetchData() {
      try {
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
        setAccessLevels(accessData);
      } catch (error) {
        setError((error as Error).message);
        console.error(error);
      }
    }

    fetchData();
  }, []);

  function getAccessForPage(pageId: number): string | null {
    if (!currentUserId) return null;

    const access = accessLevels.find(
      (a) => a.user === currentUserId && a.page === pageId
    );

    return access?.access_level || null;
  }

  return (
    <main className="dashboard-wrapper">
      <div className="pages-container">
        <h1>Pages</h1>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <div className="page-gallery">
          {pages.map((page: any) => {
            const accessLevel = getAccessForPage(page.id);
            if (!accessLevel || accessLevel === "none") return null;

            return (
              <div className="page" key={page.id}>
                <Link to={`/page/${page.slug}`}>
                  {page.name}
                  <small>Access: {accessLevel}</small>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
