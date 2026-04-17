const TEAM_THEME_MAP = [
    { match: "barcelona", primary: "#a50044", secondary: "#004d98", glow: "rgba(165, 0, 68, 0.32)" },
    { match: "real madrid", primary: "#d4af37", secondary: "#1f2937", glow: "rgba(212, 175, 55, 0.26)" },
    { match: "atlético", primary: "#c8102e", secondary: "#1d4ed8", glow: "rgba(200, 16, 46, 0.26)" },
    { match: "atletico", primary: "#c8102e", secondary: "#1d4ed8", glow: "rgba(200, 16, 46, 0.26)" },
    { match: "arsenal", primary: "#ef4444", secondary: "#991b1b", glow: "rgba(239, 68, 68, 0.24)" },
    { match: "chelsea", primary: "#2563eb", secondary: "#1e3a8a", glow: "rgba(37, 99, 235, 0.25)" },
    { match: "liverpool", primary: "#dc2626", secondary: "#7f1d1d", glow: "rgba(220, 38, 38, 0.24)" },
    { match: "manchester city", primary: "#38bdf8", secondary: "#0f172a", glow: "rgba(56, 189, 248, 0.22)" },
    { match: "manchester united", primary: "#b91c1c", secondary: "#111827", glow: "rgba(185, 28, 28, 0.26)" },
    { match: "tottenham", primary: "#60a5fa", secondary: "#0f172a", glow: "rgba(96, 165, 250, 0.22)" },
];

const DEFAULT_THEME = {
    primary: "#e2e8f0",
    secondary: "#0f172a",
    glow: "rgba(148, 163, 184, 0.15)",
};

export function getTeamTheme(team) {
    const name = `${team?.name || ""} ${team?.shortName || ""}`.toLowerCase();
    const match = TEAM_THEME_MAP.find((item) => name.includes(item.match));
    return match || DEFAULT_THEME;
}
