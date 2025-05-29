import { useEffect } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const { isAuthenticated, user, authInitialized } = useAuth();

  // user persistence
  useEffect(() => {
    if (authInitialized && !isAuthenticated) {
      navigate("/");
    }
  }, [authInitialized, isAuthenticated]);

  return (
    <main className="dashboard-wrapper">
      <p>{user?.exp}</p>
      <p>{user?.email}</p>
      <p>{user?.is_superuser}</p>
      <p>{user?.user_id}</p>
      <p>{user?.username}</p>
    </main>
  );
}
