import { ClipLoader } from "react-spinners";

export default function Spinner() {
  return (
    <div className="spinner-container">
      <ClipLoader color="#007bff" loading={true} size={100} />
    </div>
  );
}
