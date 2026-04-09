const SELECTED_TEAM_KEY = "footballhub:selected-team";

export function getSelectedTeam() {
    try {
        const raw = localStorage.getItem(SELECTED_TEAM_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function saveSelectedTeam(team) {
    if (!team) {
        localStorage.removeItem(SELECTED_TEAM_KEY);
        return;
    }

    localStorage.setItem(SELECTED_TEAM_KEY, JSON.stringify(team));
}
