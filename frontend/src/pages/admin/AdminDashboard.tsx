import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { readSelfUser } from "../../utils/UserCRUD";
import UserManagement from "./components/UserManagement";
import UserTable from "./components/UserTable";

export default function AdminDashboard() {
  const { isAuthenticated, authInitialized } = useAuth();

  const navigate = useNavigate();

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

  return (
    <>
      <main className="dashboard-wrapper">
        <div className="page-gallery-container">
          <h1>Pages</h1>

          <div>
            
          </div>
        </div>

        <UserManagement />

        <UserTable />
      </main>
    </>
  );
}
