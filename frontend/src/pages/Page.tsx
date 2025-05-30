import { useParams } from "react-router-dom";

export default function Page() {
  const { pageName } = useParams();

  return <main>Page</main>;
}
