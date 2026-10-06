import { Link, useLocation } from "react-router-dom";

export default function PageNotFound() {
  const location = useLocation();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md text-center space-y-5">
        <p className="text-7xl font-light text-slate-300">404</p>
        <h1 className="text-2xl font-semibold text-slate-800">
          Page not found
        </h1>
        <p className="text-slate-600">
          The page <span className="font-medium">{location.pathname}</span>{" "}
          could not be found.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
