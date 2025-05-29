import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="home-wrapper">
      <div className="home-title">
        <h1>SVG DASHBOARD</h1>
        <p>Login as:</p>
      </div>

      <div className="home-buttons">
        <Link to={"/admin-login"}>Super Admin</Link>
        <Link to={"/user-login"}>Regular User</Link>
      </div>
    </main>
  );
}
