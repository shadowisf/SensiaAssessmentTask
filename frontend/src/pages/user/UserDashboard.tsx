import { useEffect } from "react";
import { readUser } from "../../utils/UserCRUD";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  // fetch user
  useEffect(() => {
    async function fetchUser() {
      const { data } = await readUser();

      if (data.role !== "user") {
        navigate("/");
      }
    }

    fetchUser();
  }, []);

  return <main>this is the user dashboard</main>;
}
