import { Navigate } from "react-router-dom";
import Home from "./Home";
import { useFavorites } from "../features/favorites/useFavorites";

export default function HomeEntry() {
  const { favorites } = useFavorites();

  if (!favorites.length) {
    return <Navigate to="/select-favorites" replace />;
  }

  return <Home />;
}
