const BASE_URL = "/api";

function requireToken() {
  const token = import.meta.env.VITE_FOOTBALL_DATA_TOKEN;
  if (!token) {
    throw new Error(
      "Missing VITE_FOOTBALL_DATA_TOKEN. Add it to a .env.local file in your project root.",
    );
  }
  return token;
}

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || v === "ALL") return;
    sp.set(k, String(v));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function footballGet(path, params) {
  const token = requireToken();
  const url = `${BASE_URL}${path}${buildQuery(params)}`;

  const res = await fetch(url, {
    headers: {
      "X-Auth-Token": token,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// convenience helpers
export const api = {
  competition: (code) => footballGet(`/competitions/${code}`),
  standings: (code) => footballGet(`/competitions/${code}/standings`),
  matches: (code, params) =>
    footballGet(`/competitions/${code}/matches`, params),
  teams: (code) => footballGet(`/competitions/${code}/teams`),
  team: (id) => footballGet(`/teams/${id}`),
  teamMatches: (id, params) => footballGet(`/teams/${id}/matches`, params),
};

// league mapping for UI
export const LEAGUES = {
  PL: { code: "PL", name: "Premier League", flag: "🏴", country: "England" },
  PD: { code: "PD", name: "La Liga", flag: "🇪🇸", country: "Spain" },
};
