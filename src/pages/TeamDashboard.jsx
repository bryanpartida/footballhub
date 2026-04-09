import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Shield, Trophy, Users } from "lucide-react";
import { api, LEAGUES } from "../api/footballData";
import { useSelectedTeam } from "../hooks/useSelectedTeam";
import { getTeamTheme } from "../utils/teamThemes";
import { buildTeamContext } from "../utils/buildTeamContext";
import { generateTeamSummary } from "../features/summary/generateTeamSummary";

function InfoCard({ icon: Icon, title, body, meta, theme, cardId }) {
    return (
        <article className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-xl shadow-black/10 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-white/10 p-2" style={{ backgroundColor: theme.glow }}>
                    <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Context card</div>
                    <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
                </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{body}</p>
            {cardId === "form" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                    {meta.split(" • ").map((result, index) => {
                        const trimmed = result.trim();

                        const colorClass =
                            trimmed === "W"
                                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-300"
                                : trimmed === "L"
                                    ? "border-red-400/30 bg-red-500/15 text-red-300"
                                    : "border-amber-400/30 bg-amber-500/15 text-amber-300";

                        return (
                            <span
                                key={`${trimmed}-${index}`}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${colorClass}`}
                            >
                                {trimmed}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">{meta}</p>
            )}
        </article>
    );
}

function SquadCard({ player, theme }) {
    const age = player?.dateOfBirth ? calculateAge(player.dateOfBirth) : null;

    return (
        <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/7">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-white">{player.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{player.position || "Squad member"}</p>
                </div>
                <div className="rounded-full px-3 py-1 text-xs font-medium text-white" style={{ backgroundColor: theme.glow }}>
                    {player.shirtNumber ? `#${player.shirtNumber}` : "Squad"}
                </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-slate-300">
                <li>Nationality: {player.nationality || "Unknown"}</li>
                <li>Age: {age || "Unknown"}</li>
                <li>Date of birth: {player.dateOfBirth || "Unknown"}</li>
            </ul>
        </article>
    );
}

function calculateAge(dateString) {
    const dob = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }
    return age;
}

export default function TeamDashboard() {
    const { teamId } = useParams();
    const numericTeamId = Number(teamId);
    const { selectedTeam, setSelectedTeam } = useSelectedTeam();

    const teamQuery = useQuery({
        queryKey: ["team", numericTeamId],
        queryFn: () => api.team(numericTeamId),
        enabled: Number.isFinite(numericTeamId),
        staleTime: 1000 * 60 * 30,
    });

    const leagueCode = useMemo(() => {
        const fromSelected = selectedTeam?.leagueCode;
        if (fromSelected) return fromSelected;
        const running = teamQuery.data?.runningCompetitions || [];
        const league = running.find((item) => item.code === "PL" || item.code === "PD");
        return league?.code || null;
    }, [selectedTeam, teamQuery.data]);

    const scheduledMatchesQuery = useQuery({
        queryKey: ["teamMatches", numericTeamId, "scheduled"],
        queryFn: () => api.teamMatches(numericTeamId, { status: "SCHEDULED", limit: 10 }),
        enabled: Number.isFinite(numericTeamId),
        staleTime: 1000 * 60 * 5,
    });

    const finishedMatchesQuery = useQuery({
        queryKey: ["teamMatches", numericTeamId, "finished"],
        queryFn: () => api.teamMatches(numericTeamId, { status: "FINISHED", limit: 5 }),
        enabled: Number.isFinite(numericTeamId),
        staleTime: 1000 * 60 * 5,
    });

    const standingsQuery = useQuery({
        queryKey: ["standings", leagueCode],
        queryFn: () => api.standings(leagueCode),
        enabled: !!leagueCode,
        staleTime: 1000 * 60 * 10,
    });

    useEffect(() => {
        if (!teamQuery.data) return;
        setSelectedTeam({
            id: teamQuery.data.id,
            name: teamQuery.data.name,
            shortName: teamQuery.data.shortName || teamQuery.data.tla || teamQuery.data.name,
            crest: teamQuery.data.crest || teamQuery.data.crestUrl || null,
            leagueCode,
        });
    }, [teamQuery.data, leagueCode, setSelectedTeam]);

    const team = teamQuery.data;
    const theme = getTeamTheme(team || selectedTeam);
    const standingsTable = standingsQuery.data?.standings?.[0]?.table || [];

    const context = useMemo(() => {
        if (!team) return null;
        return buildTeamContext({
            team,
            scheduledMatches: scheduledMatchesQuery.data?.matches || [],
            finishedMatches: finishedMatchesQuery.data?.matches || [],
            standings: standingsTable,
        });
    }, [team, scheduledMatchesQuery.data, finishedMatchesQuery.data, standingsTable]);

    const summary = useMemo(() => {
        if (!team || !context) return "Loading today’s team context...";
        return generateTeamSummary({
            team,
            context,
            leagueName: LEAGUES[leagueCode]?.name,
        });
    }, [team, context, leagueCode]);

    if (teamQuery.isLoading) {
        return <div className="text-slate-300">Loading club dashboard...</div>;
    }

    if (teamQuery.isError || !team) {
        return <div className="text-red-300">{teamQuery.error?.message || "Failed to load club."}</div>;
    }

    const squad = (team.squad || []).slice(0, 12);

    return (
        <div className="space-y-8">
            <section
                className="overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-black/20"
                style={{ background: `linear-gradient(135deg, ${theme.glow}, rgba(255,255,255,0.03))` }}
            >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                            {LEAGUES[leagueCode]?.name || "Club dashboard"}
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            {team.crest ? <img src={team.crest} alt={`${team.name} crest`} className="h-16 w-16 object-contain" /> : null}
                            <div>
                                <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{team.name}</h1>
                                <p className="mt-2 text-base text-slate-300">A focused daily dashboard built around today’s most relevant context.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 lg:max-w-xl">
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Top summary</div>
                        <p className="mt-3 text-sm leading-7 text-slate-200">{summary}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {context?.cards?.map((card, index) => (
                    <InfoCard
                        key={card.id}
                        cardId={card.id}
                        icon={[CalendarDays, Shield, Trophy, Users][index] || CalendarDays}
                        title={card.title}
                        body={card.body}
                        meta={card.meta}
                        theme={theme}
                    />
                ))}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl md:p-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Standings shortcut</div>
                        <h2 className="mt-2 text-2xl font-semibold text-white">Table position and season pressure</h2>
                    </div>
                    <Link to="/standings" className="text-sm font-medium text-white hover:text-slate-200">
                        Open full standings →
                    </Link>
                </div>

                <div className="mt-5 text-sm leading-6 text-slate-300">
                    {context?.standingRow
                        ? `${team.shortName || team.name} is ${context.standingRow.position}${getOrdinalSuffix(context.standingRow.position)} with ${context.standingRow.points} points.`
                        : "Standings data is still loading or unavailable for this club."}
                </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl md:p-8">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Squad snapshot</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Roster overview</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        With your current API, this section is strongest as a clean squad overview. If you later switch APIs, this is the place to add real player performance stats.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {squad.length ? squad.map((player) => <SquadCard key={player.id || player.name} player={player} theme={theme} />) : (
                        <div className="text-slate-400">No squad data available.</div>
                    )}
                </div>
            </section>
        </div>
    );
}

function getOrdinalSuffix(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return "th";
    switch (n % 10) {
        case 1:
            return "st";
        case 2:
            return "nd";
        case 3:
            return "rd";
        default:
            return "th";
    }
}
