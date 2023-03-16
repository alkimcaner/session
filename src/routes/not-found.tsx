import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col gap-8 justify-center items-center">
      <span className="font-bold text-4xl text-error">Page not found</span>
      <Link to="/" className="link">
        Back to the homepage
      </Link>
    </div>
  );
}
