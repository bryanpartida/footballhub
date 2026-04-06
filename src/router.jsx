import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./layouts/Layout";

import HomeEntry from "./pages/HomeEntry";
import Home from "./pages/Home";
import SelectFavorites from "./pages/SelectFavorites";
import Leagues from "./pages/Leagues";
import LeagueOverview from "./pages/LeagueOverview";
import Standings from "./pages/Standings";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Trivia from "./pages/Trivia";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomeEntry /> },
      { path: "home", element: <Home /> },
      { path: "select-favorites", element: <SelectFavorites /> },
      { path: "leagues", element: <Leagues /> },

      { path: "league/:code", element: <LeagueOverview /> },
      { path: "league/:code/standings", element: <Standings /> },
      { path: "league/:code/matches", element: <Matches /> },
      { path: "league/:code/teams", element: <Teams /> },
      { path: "match/:matchId", element: <MatchDetail /> },

      { path: "team/:teamId", element: <TeamDetail /> },
      { path: "trivia", element: <Trivia /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);
