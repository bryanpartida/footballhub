import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout";

import Home from "./pages/Home";
import Leagues from "./pages/Leagues";
import LeagueOverview from "./pages/LeagueOverview";
import Standings from "./pages/Standings";
import Matches from "./pages/Matches";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Trivia from "./pages/Trivia";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "leagues", element: <Leagues /> },

      { path: "league/:code", element: <LeagueOverview /> },
      { path: "league/:code/standings", element: <Standings /> },
      { path: "league/:code/matches", element: <Matches /> },
      { path: "league/:code/teams", element: <Teams /> },

      { path: "team/:teamId", element: <TeamDetail /> },
      { path: "trivia", element: <Trivia /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
