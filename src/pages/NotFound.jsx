import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-200">
      <h1 className="text-3xl font-semibold text-white">Page not found</h1>
      <p className="mt-3 text-sm text-slate-400">That route is not part of the refactored v1 flow.</p>
      <Link to="/" className="mt-5 inline-block text-sm font-medium text-white hover:text-slate-200">
        Return to FootballHub →
      </Link>
    </div>
  );
}
