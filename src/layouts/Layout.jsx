import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelectedTeam } from "../hooks/useSelectedTeam";
import { getTeamTheme } from "../utils/teamThemes";

export function Layout() {
  const { selectedTeam } = useSelectedTeam();
  const theme = getTeamTheme(selectedTeam);

  return (
    <div
      className="min-h-screen flex flex-col text-slate-100"
      style={{
        background: `radial-gradient(circle at top, ${theme.glow} 0%, rgba(2, 6, 23, 0.96) 28%, #020617 62%)`,
      }}
    >
      <Navbar />
      <main className="flex-1 px-4 py-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
