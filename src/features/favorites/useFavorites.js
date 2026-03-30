import { useEffect, useState } from "react";
import { getFavorites, saveFavorites } from "./favoritesStorage";

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => getFavorites());

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isFavorite = (teamId) => favorites.includes(Number(teamId));

  const toggleFavorite = (teamId) => {
    const numericId = Number(teamId);

    setFavorites((prev) =>
      prev.includes(numericId)
        ? prev.filter((id) => id !== numericId)
        : [...prev, numericId],
    );
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
