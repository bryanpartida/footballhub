import { NavLink } from "react-router-dom";

export default function LeagueTabs({ code }) {
  const base = `/league/${code}`;

  const tabClass = ({ isActive }) =>
    `px-4 py-2 rounded-md text-sm transition ${
      isActive
        ? "bg-slate-800 text-white"
        : "text-slate-300 hover:bg-slate-900 hover:text-white"
    }`;

  return (
    <div className="flex gap-2 mb-6">
      <NavLink to={base} end className={tabClass}>
        Overview
      </NavLink>
      <NavLink to={`${base}/standings`} className={tabClass}>
        Standings
      </NavLink>
      <NavLink to={`${base}/matches`} className={tabClass}>
        Matches
      </NavLink>
      <NavLink to={`${base}/teams`} className={tabClass}>
        Teams
      </NavLink>
    </div>
  );
}
