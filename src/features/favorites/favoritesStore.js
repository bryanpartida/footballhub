import { getFavorites, saveFavorites } from "./favoritesStorage";

let favorites = normalizeFavorites(getFavorites());
const listeners = new Set();

function normalizeFavorites(values) {
  return [
    ...new Set((values || []).map((id) => Number(id)).filter(Number.isFinite)),
  ];
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeFavorites(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getFavoritesSnapshot() {
  return favorites;
}

export function setFavorites(nextFavorites) {
  favorites = normalizeFavorites(nextFavorites);
  saveFavorites(favorites);
  emit();
}

export function toggleFavoriteInStore(teamId) {
  const numericId = Number(teamId);
  if (!Number.isFinite(numericId)) return;

  if (favorites.includes(numericId)) {
    setFavorites(favorites.filter((id) => id !== numericId));
  } else {
    setFavorites([...favorites, numericId]);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== "footballhub:favorites") return;

    favorites = normalizeFavorites(getFavorites());
    emit();
  });
}
