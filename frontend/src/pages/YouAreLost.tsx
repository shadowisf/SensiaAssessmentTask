import { Link } from "react-router-dom";

export default function YouAreLost() {
  return (
    <main className="home-wrapper">
      <div className="home-title">
        <h1>ERROR 404</h1>
        <p>
          You seem to be lost. <Link to="/">Click here</Link> to return to home
          page.
        </p>
      </div>
    </main>
  );
}
