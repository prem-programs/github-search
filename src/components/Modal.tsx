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
  // const repoName = repo?.name ||

  // Generate 182 deterministic heatmap cells for 6 months (26 cols x 7 rows)
  const heatmapData = useMemo(() => {
    const levels = [null, "l1", "l1", "l2", "l2", "l3", "l3", "l4"];
    const seed = username.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const result = [];
    for (let i = 0; i < 182; i++) {
      const pseudoRandom = (Math.sin(seed + i * 1.5) + 1) / 2;
      if (pseudoRandom > 0.42) {
        const levelIdx = Math.floor(pseudoRandom * 7) + 1;
        result.push(levels[levelIdx] || "l1");
      } else {
        result.push(null);
      }
    }
    return result;
  }, [username]);

  type Skills = {
    skill: string,
    percentage: number;
  }
  type Repos = {
    repoName: string,
    lang: string,
    lastUpdated: string
  }



  const [skill, setskill] = useState<Skills[]>([]);

  useEffect(() => {
    async function langData() {
      try {
        const res = await fetch(`http://localhost:8000/github/${username}/language`);
        if (!res.ok) {
          const reposResponse = await fetch(`http://localhost:8000/github/${username}/repos`);

          if (!reposResponse.ok) {
            console.error("Failed to fetch repos");
            return;
          }

          const response = await fetch(`http://localhost:8000/github/${username}/language`);

          if (!response.ok) {
            console.error("Failed to fetch language data");
            return;
          }

          const data = await response.json();
          if (Array.isArray(data)) {
            setskill(data);
          }
        } else {
          const data = await res.json();
          if (Array.isArray(data)) {
            setskill(data);
          }
        }
      } catch (error) {
        console.error("Error fetching language data:", error);
      }
    }
    if (username) {
      langData();
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
                  <div className="text-xl font-bold text-slate-900 font-mono">127</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">avg last 6 months</div>
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
                  <div className="text-xl font-bold text-slate-900 font-mono">34d</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">current run</div>
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
                  <div className="text-xs font-semibold text-slate-600 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Contribution heatmap — last 6 months
                  </div>

                  <div className="grid grid-cols-[repeat(26,minmax(0,1fr))] gap-1">
                    {heatmapData.map((lvl, idx) => {
                      let bgStyle = { backgroundColor: "#f1f5f9" }; // surface-0 default
                      if (lvl === "l1") bgStyle = { backgroundColor: "#c6efce" };
                      if (lvl === "l2") bgStyle = { backgroundColor: "#76d193" };
                      if (lvl === "l3") bgStyle = { backgroundColor: "#2ea84f" };
                      if (lvl === "l4") bgStyle = { backgroundColor: "#1a6e32" };

                      return (
                        <div
                          key={idx}
                          className="h-2.5 rounded-[2px] border border-slate-200/50 transition-colors"
                          style={bgStyle}
                          title={`Day ${idx + 1}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100">
                  <span>Less</span>
                  <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200" />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#c6efce" }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#76d193" }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#2ea84f" }} />
                  <div className="w-2.5 h-2.5 rounded-[2px]" style={{ backgroundColor: "#1a6e32" }} />
                  <span>More</span>
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

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="font-semibold text-slate-900">python-ai-toolkit</div>
                      <div className="text-[11px] text-slate-500">Python · Last pushed 2d ago</div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> 834
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-slate-400" /> 112
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> 8 contribs
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="font-semibold text-slate-900">go-microservices-starter</div>
                      <div className="text-[11px] text-slate-500">Go · Last pushed 5d ago</div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> 312
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-slate-400" /> 58
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> 3 contribs
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="font-semibold text-slate-900">ts-form-validator</div>
                      <div className="text-[11px] text-slate-500">TypeScript · Last pushed 12d ago</div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> 198
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-slate-400" /> 31
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> solo
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <div className="font-semibold text-slate-900">rust-cli-boilerplate</div>
                      <div className="text-[11px] text-slate-500">Rust · Last pushed 1mo ago</div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> 76
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-slate-400" /> 14
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" /> solo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Row 4: Recent Activity + Collaboration Signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Activity Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">


                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-600">
                        Merged PR <strong className="text-slate-900 font-medium">#84 — add batch inference</strong> in ml-pipeline-toolkit
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">2h ago</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-600">
                        Reviewed <strong className="text-slate-900 font-medium">3 commits</strong> on go-microservices-starter
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">5h ago</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-600">
                        Opened issue <strong className="text-slate-900 font-medium">#121 — memory leak on large batches</strong>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">1d ago</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-600">
                        Pushed <strong className="text-slate-900 font-medium">6 commits</strong> to ts-form-validator
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">2d ago</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mt-1 shrink-0" />
                    <div className="flex-1">
                      <span className="text-slate-600">
                        Reviewed PR by <strong className="text-slate-900 font-medium">@ananya_dev</strong> in forked repo
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">3d ago</span>
                  </div>
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

            {/* 8. API Endpoints Section */}
            <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-600 mb-2.5 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-500" />
                GitHub API endpoints powering this dashboard
              </div>

              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /users/{username}
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /users/{username}/repos
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /users/{username}/events
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/commits
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/pulls
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/languages
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/stats/contributors
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/stats/participation
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                  GET /repos/{`{owner}`}/{`{repo}`}/contents/README.md
                </span>
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
