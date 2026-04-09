import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import TeamEntry from "./pages/TeamEntry";
import TeamSelection from "./pages/TeamSelection";
import TeamDashboard from "./pages/TeamDashboard";
import Standings from "./pages/Standings";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <TeamEntry /> },
      { path: "select-team", element: <TeamSelection /> },
      { path: "club/:teamId", element: <TeamDashboard /> },
      { path: "standings", element: <Standings /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
