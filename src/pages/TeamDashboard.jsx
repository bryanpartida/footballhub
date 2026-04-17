import { useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Shield, Trophy, Users } from "lucide-react";
import { api, LEAGUES } from "../api/footballData";
import { useSelectedTeam } from "../hooks/useSelectedTeam";
import { getTeamTheme } from "../utils/teamThemes";
import { buildTeamContext } from "../utils/buildTeamContext";
import { generateTeamSummary } from "../features/summary/generateTeamSummary";
import TeamRosterSection from "../components/TeamRosterSection";

function InfoCard({ icon, title, body, meta, theme, cardId }) {
    const Icon = icon;

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

function TeamBriefingCard({ team, summary, theme, leagueName }) {
    const shortName = team?.shortName || team?.name || "This club";

    return (
        <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/10 bg-black/25 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-slate-400">What to know today</div>
                    <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">
                        {shortName}'s current context
                    </h2>
                </div>
                <div
                    className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: theme.glow }}
                >
                    Team brief
                </div>
            </div>

            <p className="mt-5 text-base leading-8 text-slate-100 md:text-[1.05rem]">
                {summary}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                <span>{leagueName || "Club dashboard"}</span>
                <span>Selected club experience</span>
            </div>
        </div>
    );
}

function StandingsPreviewCard({ team, theme, standingsTable }) {
    const previewRows = useMemo(
        () => getStandingsPreviewRows(standingsTable, team?.id, 3),
        [standingsTable, team?.id],
    );
    const selectedRow = previewRows.find((row) => Number(row.team?.id) === Number(team?.id)) || null;

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Table preview</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Positions around {team?.shortName || team?.name}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        A quick view of the teams directly around your club so the local table pressure is easy to understand at a glance.
                    </p>
                </div>
                <Link
                    to="/standings"
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
                >
                    Open full standings
                </Link>
            </div>

            {selectedRow ? (
                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-200">
                    {team?.shortName || team?.name} is currently {selectedRow.position}
                    {getOrdinalSuffix(selectedRow.position)} with {selectedRow.points} points and a {formatGoalDifference(selectedRow.goalDifference)} goal difference.
                </div>
            ) : null}

            {!previewRows.length ? (
                <div className="mt-6 text-sm text-slate-400">Standings data is still loading or unavailable for this club.</div>
            ) : (
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10">
                    <div className="grid grid-cols-[64px_1fr_72px_72px] gap-3 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs uppercase tracking-[0.18em] text-slate-400">
                        <div>Pos</div>
                        <div>Club</div>
                        <div>Pts</div>
                        <div>GD</div>
                    </div>

                    <div className="divide-y divide-white/8">
                        {previewRows.map((row) => {
                            const isSelected = Number(row.team?.id) === Number(team?.id);

                            return (
                                <div
                                    key={row.team?.id || row.position}
                                    className={`grid grid-cols-[64px_1fr_72px_72px] items-center gap-3 px-5 py-4 text-sm transition ${isSelected ? "bg-white/[0.07]" : "bg-transparent"
                                        }`}
                                >
                                    <div className="font-semibold text-white">{row.position}</div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        {row.team?.crest ? (
                                            <img
                                                src={row.team.crest}
                                                alt={`${row.team.name} crest`}
                                                className="h-6 w-6 object-contain"
                                            />
                                        ) : null}
                                        <div className="min-w-0">
                                            <div className={`truncate ${isSelected ? "font-semibold text-white" : "text-slate-200"}`}>
                                                {row.team?.name}
                                            </div>
                                            {isSelected ? (
                                                <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                                    Selected club
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className={isSelected ? "font-semibold text-white" : "text-slate-100"}>{row.points}</div>
                                    <div
                                        className={isSelected ? "font-semibold" : "text-slate-300"}
                                        style={isSelected ? { color: theme.glow } : undefined}
                                    >
                                        {formatGoalDifference(row.goalDifference)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </section>
    );
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
    const standingsTable = useMemo(() => standingsQuery.data?.standings?.[0]?.table || [], [standingsQuery.data]);

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
        if (!team || !context) return "Loading today's team context...";
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

    return (
        <div className="space-y-8">
            <section
                className="overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-2xl shadow-black/20"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 10% 15%, ${hexToRgba(theme.primary, 0.18)} 0%, transparent 34%),
                        radial-gradient(circle at 88% 18%, ${hexToRgba(theme.secondary, 0.16)} 0%, transparent 28%),
                        linear-gradient(155deg, rgba(15,23,42,0.96) 0%, rgba(17,24,39,0.94) 45%, rgba(2,6,23,0.98) 100%)
                    `,
                }}
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

                    <TeamBriefingCard
                        team={team}
                        summary={summary}
                        theme={theme}
                        leagueName={LEAGUES[leagueCode]?.name}
                    />
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

            <StandingsPreviewCard team={team} theme={theme} standingsTable={standingsTable} />

            <TeamRosterSection team={team} theme={theme} />
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

function getStandingsPreviewRows(table, teamId, radius = 3) {
    if (!Array.isArray(table) || !table.length || !teamId) return [];

    const selectedIndex = table.findIndex((row) => Number(row.team?.id) === Number(teamId));
    if (selectedIndex === -1) return [];

    const previewSize = radius * 2 + 1;
    let start = Math.max(0, selectedIndex - radius);
    let end = Math.min(table.length, selectedIndex + radius + 1);

    if (end - start < previewSize) {
        if (start === 0) {
            end = Math.min(table.length, previewSize);
        } else if (end === table.length) {
            start = Math.max(0, table.length - previewSize);
        }
    }

    return table.slice(start, end);
}

function formatGoalDifference(value) {
    if (typeof value !== "number") return "0";
    return value > 0 ? `+${value}` : String(value);
}

function hexToRgba(hex, alpha) {
    const normalized = hex?.replace("#", "");
    if (!normalized || normalized.length !== 6) {
        return `rgba(148, 163, 184, ${alpha})`;
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16);
    const g = Number.parseInt(normalized.slice(2, 4), 16);
    const b = Number.parseInt(normalized.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
