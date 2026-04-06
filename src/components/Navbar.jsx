import { Link, NavLink } from "react-router-dom";
import logo from "../logo/footballhub-logo.png";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `hover:text-white transition ${isActive ? "text-white" : "text-slate-300"}`;

  return (
    <header className="border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="FootballHub logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-xl">FootballHub</span>
        </Link>

        <nav className="flex gap-5 text-sm">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/select-favorites" className={linkClass}>
            Favorites
          </NavLink>
          <NavLink to="/leagues" className={linkClass}>
            Leagues
          </NavLink>
          <NavLink to="/trivia" className={linkClass}>
            Trivia
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
