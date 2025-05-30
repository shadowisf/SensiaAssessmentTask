import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { readSelfUser } from "../../utils/UserCRUD";
import UserManagement from "./components/UserManagement";
import UserTable from "./components/UserTable";
import ErrorMessage from "../../components/ErrorMessage";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const { isAuthenticated, authInitialized } = useAuth();

  const [pages, setPages] = useState([]);
  const [error, setError] = useState("");

  // role check
  useEffect(() => {
    async function fetchSelfUser() {
      const { data } = await readSelfUser();

      if (data.role !== "admin" || (authInitialized && !isAuthenticated)) {
        navigate("/");
      }
    }

    fetchSelfUser();
  }, [authInitialized, isAuthenticated]);

  useEffect(() => {
    async function fetchAllPages() {
      try {
        const res = await fetch("http://localhost:8000/api/readAllPages/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch pages");
        }

        const data = await res.json();

        setPages(data);
      } catch (error) {
        const msg = (error as Error).message;

        console.error(msg);
        setError(msg);
      }
    }

    fetchAllPages();
  }, []);

  return (
    <>
      <main className="dashboard-wrapper">
        <div className="pages-container">
          <h1>Pages</h1>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div className="page-gallery">
            {pages.map((page: any) => {
              return (
                <div className="page" key={page.id}>
                  <Link to={`/page/${page.slug}`}>
                    {page.name}
                    <small>Create | View | Edit | Delete</small>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <UserManagement />

        <UserTable />
      </main>
    </>
  );
}
