import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Search as SearchIcon,
  Star,
  GitFork,
  MapPin,
  FolderGit2,
  Activity,
  Layers,
  ExternalLink,
  Code2,
  Cpu,
  Sparkles,
  Calendar,
  ArrowUpRight,
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

const DEFAULT_DATA = {
  user: {
    username: "alexdev",
    name: "Alex Rivera",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Senior Backend Engineer building distributed systems, LLM pipelines, and high-performance microservices.",
    location: "San Francisco, CA",
    profileUrl: "https://github.com",
  },
  stats: {
    repositories: 42,
    stars: 128,
    forks: 35,
    activeLevel: "High",
    recentRepos: 14,
    totalRepos: 20,
    latestActivity: "4 days ago",
  },
  technicalProfile: {
    primary: "Backend / Python",
    languagesCount: 5,
    technologiesCount: 14,
  },
  topTechnologies: [
    { name: "Python", percentage: 72, color: "from-blue-600 to-indigo-600" },
    { name: "FastAPI", percentage: 60, color: "from-teal-500 to-emerald-600" },
    { name: "PostgreSQL", percentage: 48, color: "from-sky-500 to-blue-600" },
    { name: "Docker", percentage: 36, color: "from-cyan-500 to-blue-600" },
    { name: "React", percentage: 28, color: "from-indigo-500 to-purple-600" },
  ],
  technologyBreakdown: {
    Languages: [
      { name: "Python", percentage: 72 },
      { name: "JS", percentage: 48 },
      { name: "TS", percentage: 32 },
    ],
    Backend: [
      { name: "FastAPI", percentage: 60 },
      { name: "Django", percentage: 20 },
      { name: "Node", percentage: 16 },
    ],
    Frontend: [
      { name: "React", percentage: 28 },
      { name: "Next", percentage: 16 },
    ],
  },
  activity: {
    recentRepositories: "14 / 20",
    latestActivity: "4 days ago",
    bars: [
      { month: "Nov", count: 8, height: "45%" },
      { month: "Dec", count: 14, height: "70%" },
      { month: "Jan", count: 11, height: "55%" },
      { month: "Feb", count: 18, height: "90%" },
      { month: "Mar", count: 15, height: "75%" },
      { month: "Apr", count: 20, height: "100%" },
    ],
  },
  topProjects: [
    {
      name: "AI Interviewer",
      stars: 24,
      tags: ["Python", "FastAPI", "Docker"],
      description: "Automated real-time technical voice interviewer with speech recognition and dynamic evaluation.",
      url: "https://github.com",
    },
    {
      name: "GitHub Analyzer",
      stars: 12,
      tags: ["React", "FastAPI"],
      description: "Profile intelligence dashboard analyzing repositories, developer skills, and activity metrics.",
      url: "https://github.com",
    },
    {
      name: "ML Project",
      stars: 8,
      tags: ["Python", "PyTorch"],
      description: "Distributed deep learning inference pipeline with automated model quantization.",
      url: "https://github.com",
    },
  ],
};

export const Modal: React.FC<ModalProps> = ({ onClose, user: propUser }) => {
  const [hoveredBar, setHoveredBar] = useState<any>(null);

  const [currentData, setCurrentData] = useState(() => {
    if (!propUser) return DEFAULT_DATA;
    return {
      ...DEFAULT_DATA,
      user: {
        username: propUser.username || DEFAULT_DATA.user.username,
        name: propUser.name || propUser.username || DEFAULT_DATA.user.name,
        avatar: propUser.logo || propUser.avatar_url || DEFAULT_DATA.user.avatar,
        bio: propUser.bio || DEFAULT_DATA.user.bio,
        location: propUser.location || DEFAULT_DATA.user.location,
        profileUrl: propUser.profile || propUser.html_url || `https://github.com/${propUser.username || "user"}`,
      },
      stats: {
        ...DEFAULT_DATA.stats,
        repositories: propUser.repo ?? DEFAULT_DATA.stats.repositories,
      },
    };
  });

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);



  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md"
        variants={MODAL_BACKDROP_VARIANTS}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.06)] overflow-hidden my-auto max-h-[90vh] flex flex-col font-sans border border-slate-200/80"
          variants={MODAL_PANEL_VARIANTS}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subtle Ambient Radial Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-blue-500/[0.04] to-transparent pointer-events-none blur-2xl" />

          
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base text-slate-900 tracking-tight">
                  GitHub Analyzer
                </span>
              
              </div>
            </div>

            <div className="flex items-center gap-2.5">



              <button
                onClick={onClose}
                className="group flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                title="Close (Esc)"
              >
                <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-500 group-hover:text-slate-800">
                  ESC
                </kbd>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* SCROLLABLE MODAL BODY */}
          <div className="overflow-y-auto divide-y divide-slate-100 custom-modal-scrollbar">
           
            <div className="p-6 bg-gradient-to-b from-slate-50/50 to-transparent">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="relative group shrink-0">
                  <img
                    src={currentData.user.avatar}
                    alt={currentData.user.name}
                    className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-slate-200 shadow-md object-cover ring-2 ring-blue-500/10 group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => {
                      e.target.src = "https://github.com/github.png";
                    }}
                  />
                  
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {currentData.user.name}
                    </h2>
                    <span className="text-xs font-mono text-slate-500">
                      @{currentData.user.username}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {currentData.user.bio}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {currentData.user.location}
                    </span>
                    <a
                      href={currentData.user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Profile
                    </a>
                  </div>
                </div>
              </div>

              {/* QUICK STATS BAR: Repositories | Stars | Forks | Active */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums leading-tight">
                      {currentData.stats.repositories}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Repositories</div>
                  </div>
                </div>

                

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 font-mono tabular-nums leading-tight">
                      {currentData.stats.forks}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Forks</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-emerald-600 leading-tight">
                      {currentData.stats.activeLevel}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Active Status</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* TECHNICAL PROFILE                                          */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Technical Profile
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">Primary Focus</div>
                  <div className="text-base font-semibold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_6px_rgba(37,99,235,0.4)]" />
                    {currentData.technicalProfile.primary}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs">
                    Languages: <span className="font-bold text-slate-900">{currentData.technicalProfile.languagesCount}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono shadow-2xs">
                    Technologies: <span className="font-bold text-slate-900">{currentData.technicalProfile.technologiesCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* TOP TECHNOLOGIES                                           */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Top Technologies
                </h3>
              </div>

              <div className="space-y-3">
                {currentData.topTechnologies.map((tech, idx) => (
                  <div key={tech.name} className="flex items-center gap-3 text-xs sm:text-sm group">
                    <span className="w-24 font-medium text-slate-800 truncate">
                      {tech.name}
                    </span>

                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                      <motion.div
                        className={`h-full rounded-full bg-gradient-to-r ${tech.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${tech.percentage}%` }}
                        transition={{ ...SPRING_TRANSITION, delay: idx * 0.08 }}
                      />
                    </div>

                    <span className="w-10 text-right font-mono font-bold text-slate-700 tabular-nums text-xs">
                      {tech.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* TECHNOLOGY BREAKDOWN                                       */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Technology Breakdown
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Object.entries(currentData.technologyBreakdown).map(([category, skills]) => (
                  <div
                    key={category}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-colors"
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 pb-1.5 border-b border-slate-200 flex items-center justify-between">
                      <span>{category}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {skills.length} items
                      </span>
                    </div>

                    <div className="space-y-2">
                      {skills.map((skill) => (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between text-xs text-slate-700 font-medium"
                        >
                          <span>{skill.name}</span>
                          <span className="font-mono text-slate-500 font-semibold text-[11px] tabular-nums">
                            {skill.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* ACTIVITY                                                   */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Activity
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500">Recent repositories: </span>
                    <span className="font-bold text-slate-900 font-mono">
                      {currentData.activity.recentRepositories}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Latest activity: </span>
                    <span className="font-bold text-emerald-600 font-mono">
                      {currentData.activity.latestActivity}
                    </span>
                  </div>
                </div>

                {/* Activity Velocity Chart */}
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span>Repository Activity Velocity (Last 6 Months)</span>
                    {hoveredBar && (
                      <span className="text-emerald-700 font-mono font-medium animate-fadeIn">
                        {hoveredBar.month}: {hoveredBar.count} updates
                      </span>
                    )}
                  </div>

                  <div className="h-20 flex items-end justify-between gap-2 sm:gap-3 px-1 pt-2">
                    {currentData.activity.bars.map((bar, idx) => (
                      <div
                        key={bar.month}
                        onMouseEnter={() => setHoveredBar(bar)}
                        onMouseLeave={() => setHoveredBar(null)}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                      >
                        <div className="relative w-full flex justify-center items-end h-full">
                          <motion.div
                            className="w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-blue-600 to-teal-500 opacity-80 group-hover:opacity-100 group-hover:scale-y-105 transition-all origin-bottom shadow-xs"
                            style={{ height: bar.height }}
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{ ...SPRING_TRANSITION, delay: idx * 0.06 }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-900 transition-colors font-medium">
                          {bar.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ────────────────────────────────────────────────────────── */}
            {/* TOP PROJECTS                                               */}
            {/* ────────────────────────────────────────────────────────── */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Top Projects
                </h3>
              </div>

              <div className="space-y-2.5">
                {currentData.topProjects.map((project) => (
                  <div
                    key={project.name}
                    className="p-3.5 rounded-xl bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all duration-200 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-sm text-blue-600 group-hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        {project.name}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>

                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-700 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 shadow-2xs">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          {project.stars}
                        </span>

                        <div className="flex flex-wrap gap-1">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200/80 shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
