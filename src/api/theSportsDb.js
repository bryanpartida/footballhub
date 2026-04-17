const BASE_URL = "/sportsdb";

function buildQuery(params = {}) {
    const sp = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        sp.set(key, String(value));
    });

    const qs = sp.toString();
    return qs ? `?${qs}` : "";
}

async function theSportsDbGet(path, params) {
    const url = `${BASE_URL}/${path}${buildQuery(params)}`;
    const response = await fetch(url);

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`TheSportsDB error ${response.status}: ${text || response.statusText}`);
    }

    return response.json();
}

export const theSportsDbApi = {
    searchPlayers: (playerName) => theSportsDbGet("searchplayers.php", { p: playerName }),
};
