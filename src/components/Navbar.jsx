import { Link, NavLink } from "react-router-dom";
import logo from "../logo/footballhub-logo.png";
import { useSelectedTeam } from "../hooks/useSelectedTeam";

export default function Navbar() {
  const { selectedTeam } = useSelectedTeam();

  const linkClass = ({ isActive }) =>
    `transition text-sm ${isActive ? "text-white" : "text-slate-300 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to={selectedTeam ? `/club/${selectedTeam.id}` : "/select-team"} className="flex items-center gap-3">
          <img src={logo} alt="FootballHub logo" className="h-8 w-8 object-contain" />
          <div>
            <div className="text-lg font-semibold tracking-tight">FootballHub</div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Today for your team
            </div>
          </div>
        </Link>

        <nav className="flex items-center gap-5">
          {selectedTeam ? (
            <>
              <NavLink to={`/club/${selectedTeam.id}`} className={linkClass}>
                Today
              </NavLink>
              <NavLink to="/standings" className={linkClass}>
                Table Positions
              </NavLink>
              <NavLink to="/select-team" className={linkClass}>
                Change Team
              </NavLink>
            </>
          ) : (
            <NavLink to="/select-team" className={linkClass}>
              Select Team
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
