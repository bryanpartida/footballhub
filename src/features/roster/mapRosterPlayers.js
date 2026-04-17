import { getPlayerPortrait } from "./playerPlaceholder";

const POSITION_ORDER = {
    Goalkeeper: 0,
    Defender: 1,
    "Centre-Back": 1,
    "Left-Back": 1,
    "Right-Back": 1,
    Midfielder: 2,
    "Defensive Midfield": 2,
    "Central Midfield": 2,
    "Attacking Midfield": 2,
    "Left Midfield": 2,
    "Right Midfield": 2,
    Winger: 3,
    "Left Winger": 3,
    "Right Winger": 3,
    Attacker: 4,
    Forward: 4,
    Striker: 4,
};

export function mapRosterPlayers(squad = []) {
    return squad
        .filter((person) => (person?.role || "PLAYER") !== "COACH")
        .map((player, index) => {
            const dateOfBirth = normalizeDate(player?.dateOfBirth);

            return {
                id: player?.id || `${player?.name || "player"}-${index}`,
                name: player?.name || "Unknown player",
                position: player?.position || "Squad member",
                nationality: player?.nationality || "Nationality unavailable",
                countryOfBirth: player?.countryOfBirth || null,
                shirtNumber: normalizeShirtNumber(player?.shirtNumber),
                dateOfBirth,
                formattedDateOfBirth: formatDateOfBirth(dateOfBirth),
                age: getPlayerAge(dateOfBirth),
                role: player?.role || "PLAYER",
                portrait: getPlayerPortrait(player),
            };
        })
        .sort(comparePlayers);
}

export function getPlayerAge(dateString) {
    if (!dateString) return null;

    const dob = new Date(dateString);
    if (Number.isNaN(dob.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age >= 0 ? age : null;
}

function comparePlayers(a, b) {
    const aOrder = POSITION_ORDER[a.position] ?? 99;
    const bOrder = POSITION_ORDER[b.position] ?? 99;

    if (aOrder !== bOrder) return aOrder - bOrder;

    if (a.shirtNumber != null && b.shirtNumber != null && a.shirtNumber !== b.shirtNumber) {
        return a.shirtNumber - b.shirtNumber;
    }

    if (a.shirtNumber != null && b.shirtNumber == null) return -1;
    if (a.shirtNumber == null && b.shirtNumber != null) return 1;

    return a.name.localeCompare(b.name);
}

function normalizeDate(value) {
    if (!value) return null;
    return String(value).split("T")[0];
}

function formatDateOfBirth(value) {
    if (!value) return "Date of birth unavailable";

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "Date of birth unavailable";

    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(parsed);
}

function normalizeShirtNumber(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : null;
}
