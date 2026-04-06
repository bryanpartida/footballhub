import { useSyncExternalStore } from "react";
import {
  subscribeFavorites,
  getFavoritesSnapshot,
  toggleFavoriteInStore,
} from "./favoritesStore";

export function useFavorites() {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getFavoritesSnapshot,
  );

  const isFavorite = (teamId) => favorites.includes(Number(teamId));

  const toggleFavorite = (teamId) => {
    toggleFavoriteInStore(teamId);
  };

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  };
}
