import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function NotFound404() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-6"
      style={{
        backgroundColor: "var(--primary)",
        color: "var(--neutral)",
      }}
    >
      <h1 className="text-9xl font-bold" style={{ color: "var(--accent)" }}>
        404
      </h1>
      <h2 className="text-3xl md:text-4xl font-semibold mt-4">
        Page Not Found
      </h2>
      <p className="mt-2 text-base md:text-lg max-w-md">
        Sorry, the page you're looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl text-base font-medium transition hover:opacity-90"
        style={{
          backgroundColor: "var(--accent)",
          color: "var(--neutral)",
        }}
      >
        <ArrowLeft size={20} />
        Go Back Home
      </Link>
    </div>
  );
}
