export default function FavoriteButton({
  isActive,
  onClick,
  className = "",
  compact = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md font-semibold transition ${
        isActive
          ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
          : "bg-slate-800 text-white hover:bg-slate-700"
      } ${compact ? "px-3 py-1.5 text-sm" : "px-4 py-2"} ${className}`}
      aria-pressed={isActive}
    >
      {isActive ? "★ Favorited" : "☆ Add Favorite"}
    </button>
  );
}
