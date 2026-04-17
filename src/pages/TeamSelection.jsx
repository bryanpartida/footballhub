import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useLeagueTeams } from "../hooks/useLeagueTeams";
import { useSelectedTeam } from "../hooks/useSelectedTeam";
import {
    getTeamCity,
    getTeamHeroImage,
    getTeamTheme,
    getTeamShortDisplayName,
} from "../config/teamMeta";

function TeamCard({ team, isDimmed, onSelect }) {
    const theme = getTeamTheme(team);

    return (
        <button
            type="button"
            onClick={() => onSelect(team)}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:border-white/20 hover:bg-white/8 ${isDimmed ? "scale-[0.985] opacity-35 blur-[1.5px] saturate-50" : ""
                }`}
            style={{
                background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(255,255,255,0.04) 100%)`,
            }}
        >
            <div className="relative flex min-h-[180px] flex-col justify-between p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                            {team.leagueCode}
                        </div>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
                            {team.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">
                            Enter a daily dashboard centered on this club.
                        </p>
                    </div>

                    {team.crest ? (
                        <img
                            src={team.crest}
                            alt={`${team.name} crest`}
                            className="h-16 w-16 object-contain"
                        />
                    ) : null}
                </div>
            </div>
        </button>
    );
}

function ExpandedTeamCard({ team, onGoToTeam }) {
    const theme = getTeamTheme(team);
    const heroImage = getTeamHeroImage(team);
    const cityLabel = getTeamCity(team);
    const shortName = getTeamShortDisplayName(team);

    return (
        <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/90 shadow-2xl shadow-black/60"
            onClick={(e) => e.stopPropagation()}
            style={{
                background: heroImage
                    ? undefined
                    : `linear-gradient(135deg, ${theme.glow} 0%, rgba(15,23,42,0.96) 45%, rgba(2,6,23,0.96) 100%)`,
            }}
        >
            {heroImage ? (
                <>
                    <img
                        src={heroImage}
                        alt={`${team.name} hero`}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/55" />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(135deg, ${theme.glow} 0%, rgba(2,6,23,0.18) 35%, rgba(2,6,23,0.82) 100%)`,
                        }}
                    />
                </>
            ) : null}

            <div className="relative z-10 grid min-h-[420px] gap-8 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-10">
                <div className="flex flex-col justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-slate-300">
                            {team.leagueCode === "PL" ? "Premier League" : "La Liga"}
                        </div>

                        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                            {team.name}
                        </h2>

                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 md:text-lg">
                            A premium daily dashboard focused entirely on {shortName}: match context,
                            recent form, standings pressure, and a clean squad overview.
                        </p>
                    </div>

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={onGoToTeam}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl transition hover:scale-[1.01]"
                        >
                            Go to {cityLabel}
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-end justify-start md:justify-end">
                    <div className="flex w-full max-w-sm items-end gap-5 rounded-[1.75rem] border border-white/10 bg-black/20 p-6 backdrop-blur-md">
                        {team.crest ? (
                            <img
                                src={team.crest}
                                alt={`${team.name} crest`}
                                className="h-24 w-24 shrink-0 object-contain"
                            />
                        ) : null}

                        <div>
                            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                Selected club
                            </div>
                            <div className="mt-2 text-2xl font-semibold text-white">{shortName}</div>
                            <div className="mt-2 text-sm text-slate-300">
                                Theme, context cards, and one AI summary built around this club.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TeamSelection() {
    const navigate = useNavigate();
    const { teams, isLoading, isError, error } = useLeagueTeams();
    const { selectedTeam, setSelectedTeam } = useSelectedTeam();
    const [activeTeam, setActiveTeam] = useState(selectedTeam || null);

    const groupedTeams = useMemo(() => {
        return {
            PL: teams.filter((team) => team.leagueCode === "PL"),
            PD: teams.filter((team) => team.leagueCode === "PD"),
        };
    }, [teams]);

    function handleSelect(team) {
        setActiveTeam(team);
    }

    function handleGoToTeam() {
        if (!activeTeam) return;
        setSelectedTeam(activeTeam);
        navigate(`/club/${activeTeam.id}`);
    }

    return (
        <div className="relative space-y-10">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-10">
                <div className="max-w-3xl">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Choose one club</div>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
                        Build the entire experience around one team.
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                        Pick one Premier League or La Liga team, then enter a premium daily dashboard built entirely around that club.
                    </p>
                </div>
            </section>

            {isLoading ? <div className="text-slate-300">Loading clubs...</div> : null}
            {isError ? <div className="text-red-300">{error?.message || "Failed to load clubs."}</div> : null}

            {!isLoading && !isError ? (
                <div className={`space-y-10 transition-all duration-300 ${activeTeam ? "pointer-events-none" : ""}`}>
                    {[
                        ["PL", "Premier League"],
                        ["PD", "La Liga"],
                    ].map(([code, title]) => (
                        <section key={code} className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-white">{title}</h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Select one club to enter its daily context dashboard.
                                </p>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-4">
                                {groupedTeams[code].map((team) => (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        isDimmed={Boolean(activeTeam)}
                                        onSelect={handleSelect}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            ) : null}

            {activeTeam ? (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-md"
                    onClick={() => setActiveTeam(null)}
                >
                    <ExpandedTeamCard team={activeTeam} onGoToTeam={handleGoToTeam} />
                </div>
            ) : null}
        </div>
    );
}