import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <span className="text-4xl font-bold text-error">Page not found</span>
      <Link to="/" className="link">
        Back to the homepage
      </Link>
    </div>
  );
}
