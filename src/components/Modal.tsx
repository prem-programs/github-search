import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  Users,
  GitFork,
  Briefcase,
  Check,
  Code2,
  FileText,
  GitPullRequest,
  GitCommit,
  Star,
  Flame,
  MessageSquare,
  Plus,
  Calendar,
  Pencil,
  Folder,
  Activity,
  Award,
  Terminal,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface ModalProps {
  onClose: () => void;
  user?: any;
  repo?: any;
}

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.8,
} as const;

const MODAL_BACKDROP_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" as const } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: "easeIn" as const } },
} as const;

const MODAL_PANEL_VARIANTS = {
  initial: { opacity: 0, scale: 0.95, y: 16 },
  animate: { opacity: 1, scale: 1, y: 0, transition: SPRING_TRANSITION },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.15 } },
} as const;


export const Modal: React.FC<ModalProps> = ({ onClose, user }) => {
  const [copied, setCopied] = useState(false);

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);





  // Format user dynamic data with rich fallbacks
  const username = user?.login || user?.username || "github_username";
  const displayName = user?.name || username;
  const avatarUrl = user?.avatar_url || user?.logo || user?.avatar || null;
  const location = user?.location || "Pune, India";
  const hireableStatus = user?.hireable ? "Open to work" : user?.company || "Open to work";
  const devScore = user?.public_repos
    ? Math.min(99, Math.max(65, Math.floor(user.public_repos * 1.4 + 68)))
    : 84;


  interface Skills {
    skill: string;
    percentage: number;
  }
  interface iRepo {
    name: string;
    stargazers_count?: number;
    forks_count?: number;
    size?: number;
    language?: string;
    updated_at?: string;
  }
  interface Activity {
    type: string;
    color: string;
    text: string;
    time: string;
  }
  interface ContributionDay {
    date: string;
    count: number;
    level: number;
  }
  interface ContributionWeek {
    days: ContributionDay[];
  }
  interface ContributionData {
    totalContributions: number;
    currentStreak: number;
    longestStreak: number;
    weeks: ContributionWeek[];
  }

  const [skill, setskill] = useState<Skills[]>([]);
  const [irepo, setirepo] = useState<iRepo[]>([]);
  const [Activities, setActivities] = useState<Activity[]>([]);
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [loadingContributions, setLoadingContributions] = useState<boolean>(true);
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  const getContributionColor = (level: number) => {
    switch (level) {
      case 1:
        return "#9be9a8";
      case 2:
        return "#40c463";
      case 3:
        return "#30a14e";
      case 4:
        return "#216e39";
      default:
        return "#ebedf0";
    }
  };

  const formatContributionDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Last 26 weeks for 6 months view
  const displayedWeeks = useMemo(() => {
    if (!contributions?.weeks || contributions.weeks.length === 0) {
      return Array.from({ length: 26 }, () => ({
        days: Array.from({ length: 7 }, () => ({ date: "", count: 0, level: 0 })),
      }));
    }
    return contributions.weeks.slice(-26);
  }, [contributions]);

  const visibleContributionsCount = useMemo(() => {
    if (!contributions?.weeks) return 0;
    return displayedWeeks.reduce(
      (acc, w) => acc + w.days.reduce((dAcc, d) => dAcc + (d.count || 0), 0),
      0
    );
  }, [displayedWeeks, contributions]);

  useEffect(() => {
    async function fetchData() {
      setLoadingContributions(true);
      try {
        // Ensure repos and skills are synced in backend
        try {
          await fetch(`http://localhost:8000/github/${encodeURIComponent(username)}/repos`);
        } catch (e) {
          console.error("Failed to sync repos:", e);
        }

        const [resLang, resImpact, resActivity, resContrib] = await Promise.all([
          fetch(`http://localhost:8000/github/${encodeURIComponent(username)}/language`),
          fetch(`http://localhost:8000/github/${encodeURIComponent(username)}/impact`),
          fetch(`http://localhost:8000/github/${encodeURIComponent(username)}/activity`),
          fetch(`http://localhost:8000/github/${encodeURIComponent(username)}/contributions`),
        ]);

        // Handle language data
        if (resLang.ok) {
          const data = await resLang.json();
          if (Array.isArray(data)) {
            setskill(data);
          }
        } else {
          console.error("Failed to fetch language data");
        }

        // Handle impact/repos data
        if (resImpact.ok) {
          const idata = await resImpact.json();
          const repos = Array.isArray(idata) ? idata : idata?.best4;
          if (Array.isArray(repos)) {
            setirepo(repos);
          }
        } else {
          console.error("Failed to fetch impact data");
        }

        // Handle activity data
        if (resActivity.ok) {
          const data = await resActivity.json();
          if (Array.isArray(data)) {
            setActivities(data);
          }
        } else {
          console.error("Failed to fetch activity data");
        }

        // Handle contributions data
        if (resContrib.ok) {
          const cdata = await resContrib.json();
          if (cdata && Array.isArray(cdata.weeks)) {
            setContributions(cdata);
          }
        } else {
          console.error("Failed to fetch contribution data");
        }
      } catch (error) {
        console.error("Error fetching modal data:", error);
      } finally {
        setLoadingContributions(false);
      }
    }

    if (username && username !== "github_username") {
      fetchData();
    }
  }, [username]);



  const handleCopyPrompt = () => {
    const text = `Write Python code to fetch all these GitHub API endpoints for user '${username}' and compute the developer score and commit quality metrics shown in the dashboard.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
        variants={MODAL_BACKDROP_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-slate-200 font-sans"
          variants={MODAL_PANEL_VARIANTS}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="font-semibold text-base text-slate-900 tracking-tight flex items-center gap-2">
                  GitHub Developer Dashboard

                </h1>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              title="Close (Esc)"
            >
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-500">
                ESC
              </kbd>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Dashboard Body */}
          <div className="overflow-y-auto p-5 sm:p-6 space-y-5 custom-modal-scrollbar text-slate-800 bg-slate-50/50">
            {/* 1. Profile Header Top Card */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <div className="relative shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-200 shadow-sm ring-4 ring-blue-500/10"
                    onError={(e: any) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center font-bold text-lg sm:text-xl text-blue-600 shrink-0"
                  style={{ display: avatarUrl ? "none" : "flex" }}
                >
                  {username.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  {displayName}
                  {displayName !== username && (
                    <span className="text-xs font-normal text-slate-500 ml-2">@{username}</span>
                  )}
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1.5 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {location}
                  </span>

                  <span className="flex items-center gap-1 text-emerald-600 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> {hireableStatus}
                  </span>
                </div>
              </div>

              <div className="text-center px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
                <div className="text-2xl font-bold text-blue-600 font-mono tracking-tight">
                  {devScore}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">Dev score</div>
              </div>
            </div>

            {/* 2. Badges Earned */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5" /> Consistent committer
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 flex items-center gap-1.5 font-medium">
                <Code2 className="w-3.5 h-3.5" /> Polyglot (5 langs)
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5" /> Active collaborator
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5" /> Docs writer
              </span>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5 font-medium">
                <GitPullRequest className="w-3.5 h-3.5" /> High PR merge rate
              </span>
            </div>

            {/* 3. Core Metrics Section */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-blue-600" /> Commits / mo
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {contributions?.totalContributions !== undefined
                      ? Math.round(contributions.totalContributions / 12)
                      : "..."}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">avg past 12 months</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <GitPullRequest className="w-3.5 h-3.5 text-purple-600" /> PR merge rate
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">91%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">42 of 46 merged</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500" /> Stars earned
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">1.4k</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">across 18 repos</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> Streak
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">
                    {contributions?.currentStreak !== undefined ? `${contributions.currentStreak}d` : "0d"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {contributions?.longestStreak !== undefined
                      ? `max ${contributions.longestStreak}d streak`
                      : "current run"}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-600" /> Reviews given
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">68</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">last 90 days</div>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-xs">
                  <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-600" /> Lines added
                  </div>
                  <div className="text-xl font-bold text-slate-900 font-mono">48k</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">net positive delta</div>
                </div>
              </div>
            </div>

            {/* 4. Row 2: Heatmap + Language Depth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Heatmap Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Contribution heatmap — last 6 months</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-500 font-mono">
                      {loadingContributions
                        ? "Loading..."
                        : `${visibleContributionsCount} contribution${visibleContributionsCount === 1 ? "" : "s"}`}
                    </span>
                  </div>

                  {/* Heatmap Grid (Weeks as columns, Days as rows) */}
                  <div className="flex items-center gap-[3px] overflow-x-auto py-1">
                    {displayedWeeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px] flex-1 min-w-[7px]">
                        {week.days.map((day, dIdx) => (
                          <div
                            key={day.date || `${wIdx}-${dIdx}`}
                            className={`w-full aspect-square rounded-[2px] border border-slate-200/40 transition-transform hover:scale-125 hover:z-10 cursor-pointer ${
                              loadingContributions ? "animate-pulse" : ""
                            }`}
                            style={{ backgroundColor: getContributionColor(day.level) }}
                            onMouseEnter={() => day.date && setHoveredDay({ date: day.date, count: day.count })}
                            onMouseLeave={() => setHoveredDay(null)}
                            title={
                              day.date
                                ? `${day.count === 0 ? "No" : day.count} contribution${
                                    day.count === 1 ? "" : "s"
                                  } on ${formatContributionDate(day.date)}`
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Hover status text */}
                  <div className="min-h-[16px] mt-1 text-[10px] text-slate-500 text-right">
                    {hoveredDay ? (
                      <span>
                        <strong className="text-slate-700">{hoveredDay.count}</strong> contribution{hoveredDay.count === 1 ? "" : "s"} on{" "}
                        {formatContributionDate(hoveredDay.date)}
                      </span>
                    ) : (
                      <span>Hover over a cell for details</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#ebedf0" }} />
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#9be9a8" }} />
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#40c463" }} />
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#30a14e" }} />
                    <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#216e39" }} />
                    <span>More</span>
                  </div>

                  {contributions && (
                    <div className="text-[10px] text-slate-400">
                      Total year: <strong className="text-slate-600">{contributions.totalContributions}</strong>
                    </div>
                  )}
                </div>

              </div>
              {/* Language Depth Card */}

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-500" />
                  Language Used
                </div>


                {skill && skill.length > 0 ? (
                  [...skill]
                    .sort((a, b) => Number(b.percentage) - Number(a.percentage))
                    .map((item) => (
                      <div key={item.skill} className="space-y-2.5 my-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="w-16 font-medium text-slate-600 truncate" title={item.skill}>{item.skill}</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#3572A5]" style={{ width: `${item.percentage}%` }} />
                          </div>
                          <span className="w-8 text-right font-mono text-[14px] text-slate-500">{parseInt(String(item.percentage))}%</span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-xs text-slate-400 py-2 font-medium">No language breakdown available yet.</div>
                )}


              </div>
            </div>

            {/* 5. Row 3: PR Breakdown + Commit Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PR Breakdown Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4 text-slate-500" />
                  PR breakdown
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-2 bg-slate-50 border border-slate-200/80 rounded-lg mb-3">
                  <div>
                    <div className="text-xl font-bold text-emerald-600 font-mono">42</div>
                    <div className="text-[10px] text-slate-500">merged</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600 font-mono">4</div>
                    <div className="text-[10px] text-slate-500">open</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-slate-600 font-mono">2</div>
                    <div className="text-[10px] text-slate-500">closed</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg review cycles</span>
                    <strong className="font-mono text-slate-900">1.4</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Avg time to merge</span>
                    <strong className="font-mono text-slate-900">18h</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Reviews on others' PRs</span>
                    <strong className="font-mono text-slate-900">68</strong>
                  </div>
                </div>
              </div>

              {/* Commit Quality Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-slate-500" />
                  Commit message quality
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Descriptive messages</span>
                      <span className="font-mono text-[11px] text-slate-500">82%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "82%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Uses conventional commits</span>
                      <span className="font-mono text-[11px] text-slate-500">71%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "71%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">Avg message length</span>
                      <span className="font-mono text-[11px] text-slate-500">52 chars</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600">References issues/PRs</span>
                      <span className="font-mono text-[11px] text-slate-500">48%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "48%" }} />
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Above average commit hygiene
                </div>
              </div>
            </div>

            {/* 6. Top Repositories */}
            <div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-slate-500" />
                  Owned repos by impact
                </div>
                {irepo && irepo.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {irepo.map((item, idx) => (
                      <div key={item.name || idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {item.language || "Code"} · {item.updated_at ? `Updated ${new Date(item.updated_at).toLocaleDateString()}` : "Active"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 text-[11px] font-mono">
                          <span className="flex items-center gap-1" title="Stars">
                            <Star className="w-3 h-3 text-amber-500" /> {item.stargazers_count ?? 0}
                          </span>
                          <span className="flex items-center gap-1" title="Forks">
                            <GitFork className="w-3 h-3 text-slate-400" /> {item.forks_count ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 py-2">No repositories yet</div>
                )}
              </div>
            </div>

            {/* 7. Row 4: Recent Activity + Collaboration Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Activity Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-500" />
                  Recent activity
                </div>

                <div className="space-y-3 text-xs">
                  {Activities.map((act, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${act.color === 'emerald' ? 'bg-emerald-500' :
                          act.color === 'purple' ? 'bg-purple-500' : 'bg-blue-500'
                        }`} />
                      <div className="flex-1 text-slate-600">{act.text}</div>
                      <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{act.time}</span>
                    </div>
                  ))}
                  {Activities.length === 0 && (
                    <div className="text-xs text-slate-400 py-1">No recent activity</div>
                  )}
                </div>
              </div>

            {/* Collaboration Signals Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Collaboration signals
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-600">Team repos (multi-contributor)</span>
                    <strong className="font-mono text-slate-900">7 of 18</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">PRs opened in others' repos</span>
                    <strong className="font-mono text-slate-900">14</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Issue comments (non-author)</span>
                    <strong className="font-mono text-slate-900">38</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Forks of others' work</span>
                    <strong className="font-mono text-slate-900">22</strong>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-slate-600">Repos with wiki / discussions</span>
                    <strong className="font-mono text-slate-900">5</strong>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg text-xs flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-purple-600 shrink-0" />
                Strong open-source citizen profile
              </div>
            </div>
          </div>

          {/* 9. Action Button */}
          <div className="pt-1 flex justify-end">
          </div>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>,
  document.body
);
};

export default Modal;
