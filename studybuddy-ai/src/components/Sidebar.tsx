import React from "react";
import { OnboardingContext, Homework } from "../types";
import { GraduationCap, Trophy, Zap, Trash2, Calendar, ClipboardCheck, Award } from "lucide-react";

interface SidebarProps {
  onboarding: OnboardingContext;
  xp: number;
  streak: number;
  quizzesSolved: number;
  activeHomeworks: Homework[];
  onReset: () => void;
  onSelectHomework: (hw: Homework) => void;
}

export default function Sidebar({
  onboarding,
  xp,
  streak,
  quizzesSolved,
  activeHomeworks,
  onReset,
  onSelectHomework
}: SidebarProps) {
  return (
    <div className="w-full lg:w-72 glass-panel text-slate-800 p-6 flex flex-col justify-between h-full rounded-2xl border border-slate-200 bg-white relative overflow-hidden">
      {/* Background soft ambient colors */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Primary Brand Block */}
      <div className="space-y-6 relative">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg leading-tight tracking-tight text-slate-900">
              StudyBuddy AI
            </h1>
            <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-bold">
              Personal AI Tutor
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 mt-4">
          <p className="text-xs text-slate-400 font-sans font-medium">Active Profile</p>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {onboarding.name ? onboarding.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm font-semibold truncate text-slate-800">
                {onboarding.name || "Academic Learner"}
              </h3>
              <p className="text-[11px] text-slate-500 truncate font-sans">
                {onboarding.level || "Self Explorer"}
              </p>
            </div>
          </div>
          {onboarding.subject && (
            <div className="pt-2 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span className="font-sans font-medium">Subject focus:</span>
              <span className="text-indigo-600 font-bold truncate max-w-[120px]">
                {onboarding.subject}
              </span>
            </div>
          )}
        </div>

        {/* Gamified Core Metrics Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-sans">
            Personal Metrics
          </h2>
          <div className="grid grid-cols-3 gap-2">
            
            {/* XP Stats Card */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center flex flex-col justify-center items-center shadow-xs">
              <Zap className="h-4 w-4 text-amber-500 mb-1" />
              <div className="text-sm font-bold font-display text-slate-800">{xp}</div>
              <div className="text-[9px] text-slate-500 font-sans">Total XP</div>
            </div>

            {/* Streak Tracker */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center flex flex-col justify-center items-center shadow-xs">
              <span className="text-sm mb-1">🔥</span>
              <div className="text-sm font-bold font-display text-slate-800">{streak}</div>
              <div className="text-[9px] text-slate-500 font-sans">Day Streak</div>
            </div>

            {/* MCQ Quiz Scores */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center flex flex-col justify-center items-center font-sans shadow-xs">
              <Trophy className="h-4 w-4 text-yellow-500 mb-1" />
              <div className="text-sm font-bold font-display text-slate-800">{quizzesSolved}</div>
              <div className="text-[9px] text-slate-500">Quizzes</div>
            </div>

          </div>
        </div>

        {/* HomeWorks List Widget */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-sans">
              Assignments ({activeHomeworks.length})
            </h2>
            <Award className="h-3.5 w-3.5 text-indigo-550 opacity-80" />
          </div>
          {activeHomeworks.length === 0 ? (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 select-none text-center">
              <p className="text-xs text-slate-400 italic font-sans">
                No active homework yet. Ask StudyBuddy AI for challenges!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeHomeworks.map((hw, idx) => (
                <button
                  id={`sidebar-homework-btn-${idx}`}
                  key={idx}
                  onClick={() => onSelectHomework(hw)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 items-start ${
                    hw.isCompleted
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-slate-50 border-slate-200/60 hover:bg-slate-100/80 hover:border-slate-300 hover:scale-[1.01]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-semibold truncate max-w-[130px] ${hw.isCompleted ? "text-emerald-850" : "text-indigo-600"}`}>
                      {hw.title}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold font-sans ${
                      hw.isCompleted ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {hw.isCompleted ? "Complete" : hw.points || "+50 XP"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">
                    {hw.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer resetting profile parameters */}
      <div className="pt-4 mt-6 border-t border-slate-105 relative">
        <button
          id="sidebar-reset-btn"
          onClick={onReset}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-sans font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear Chat & Profile
        </button>
      </div>
    </div>
  );
}
