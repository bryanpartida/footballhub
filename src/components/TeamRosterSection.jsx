import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Goal, Sparkles, Shirt, Shield, Flag, CalendarDays } from "lucide-react";
import { api } from "../api/footballData";
import { getFeaturedPlayers } from "../features/roster/getFeaturedPlayers";
import { mapRosterPlayers } from "../features/roster/mapRosterPlayers";

function FeaturedPlayerCard({ player, theme }) {
    return (
        <article className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/25 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                    background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(15,23,42,0.18) 42%, rgba(2,6,23,0) 100%)`,
                }}
            />

            <div className="relative z-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-center">
                <div className="min-w-0">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                            <img
                                src={player.portrait}
                                alt={`${player.name} placeholder portrait`}
                                className="h-full w-full object-cover opacity-85"
                            />
                        </div>

                        <div className="min-w-0">
                            <div className="flex flex-wrap gap-2">
                                {player.featureLabels.map((label) => (
                                    <span
                                        key={label}
                                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white"
                                    >
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {label}
                                    </span>
                                ))}
                            </div>

                            <h3 className="mt-4 truncate text-2xl font-semibold text-white sm:text-3xl">{player.name}</h3>
                            <p className="mt-2 text-sm text-slate-300 sm:text-base">
                                {player.position} • {player.nationality}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <StatTile icon={Goal} label="Goals" value={player.goals} />
                    <StatTile icon={Sparkles} label="Assists" value={player.assists} />
                    <StatTile icon={Shield} label="Comps" value={player.competitionsTracked} />
                </div>
            </div>
        </article>
    );
}

function PlayerCard({ player, theme }) {
    return (
        <article className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/7">
            <div className="flex items-start gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
                    <img
                        src={player.portrait}
                        alt={`${player.name} placeholder portrait`}
                        className="h-full w-full object-cover opacity-80 transition group-hover:scale-[1.02]"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h3 className="truncate text-base font-semibold text-white">{player.name}</h3>
                            <p className="mt-1 text-sm text-slate-400">{player.position}</p>
                        </div>

                        <div
                            className="inline-flex min-w-[52px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: theme.glow }}
                        >
                            {player.shirtNumber ? `#${player.shirtNumber}` : "Squad"}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-300">
                        <MetaRow icon={Flag} label="Nationality" value={player.nationality} />
                        <MetaRow
                            icon={CalendarDays}
                            label="Age"
                            value={player.age != null ? `${player.age} years old` : "Age unavailable"}
                        />
                        <MetaRow icon={Shirt} label="Date of birth" value={player.formattedDateOfBirth} />
                    </div>
                </div>
            </div>
        </article>
    );
}

function StatTile({ icon, label, value }) {
    const Icon = icon;

    return (
        <div className="min-w-0 rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">{value}</div>
        </div>
    );
}

function MetaRow({ icon, label, value }) {
    const Icon = icon;

    return (
        <div className="flex items-center gap-3">
            <div className="rounded-lg border border-white/10 bg-black/20 p-2 text-slate-300">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
                <div className="truncate text-slate-200">{value}</div>
            </div>
        </div>
    );
}

export default function TeamRosterSection({ team, theme }) {
    const players = useMemo(() => mapRosterPlayers(team?.squad || []), [team?.squad]);
    const competitions = useMemo(
        () => dedupeCompetitions(team?.runningCompetitions || []),
        [team?.runningCompetitions],
    );

    const scorerQueries = useQueries({
        queries: competitions.map((competition) => ({
            queryKey: ["scorers", competition.code],
            queryFn: () => api.scorers(competition.code),
            enabled: Boolean(team?.id && competition?.code),
            staleTime: 1000 * 60 * 15,
            retry: false,
        })),
    });

    const scorerSources = useMemo(
        () =>
            competitions.map((competition, index) => ({
                competition,
                data: scorerQueries[index]?.data || null,
            })),
        [competitions, scorerQueries],
    );

    const { featuredPlayers, hasFeaturedStats } = useMemo(
        () =>
            getFeaturedPlayers({
                players,
                scorerSources,
                teamId: team?.id,
            }),
        [players, scorerSources, team?.id],
    );

    const featuredIds = useMemo(
        () => new Set(featuredPlayers.map((player) => Number(player.id))),
        [featuredPlayers],
    );
    const rosterPlayers = useMemo(
        () => players.filter((player) => !featuredIds.has(Number(player.id))),
        [players, featuredIds],
    );

    return (
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/10 backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">Squad snapshot</div>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Roster overview</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Live squad details come from the current team response, with a cleaner player-focused layout built for the selected club experience.
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Squad size</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{players.length}</div>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Competitions</div>
                        <div className="mt-2 text-2xl font-semibold text-white">{competitions.length || "—"}</div>
                    </div>
                </div>
            </div>

            {hasFeaturedStats ? (
                <div className="mt-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Key contributors</div>
                            <h3 className="mt-2 text-xl font-semibold text-white">Featured players</h3>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {featuredPlayers.map((player) => (
                            <FeaturedPlayerCard key={player.id} player={player} theme={theme} />
                        ))}
                    </div>
                </div>
            ) : null}

            <div className="mt-8">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Full squad</div>
                <h3 className="mt-2 text-xl font-semibold text-white">All available players</h3>

                {players.length ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {rosterPlayers.map((player) => (
                            <PlayerCard key={player.id} player={player} theme={theme} />
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 text-sm text-slate-400">No squad data is available for this team right now.</div>
                )}
            </div>
        </section>
    );
}

function dedupeCompetitions(competitions) {
    const seen = new Set();

    return competitions.filter((competition) => {
        const code = competition?.code;
        if (!code || seen.has(code)) return false;
        seen.add(code);
        return true;
    });
}
