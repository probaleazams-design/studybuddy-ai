import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OnboardingContext } from "../types";
import { GraduationCap, ArrowRight, User, BookOpen, ChevronRight, Sparkles } from "lucide-react";

interface OnboardingProps {
  onComplete: (context: OnboardingContext) => void;
  onSkip: () => void;
}

export default function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [educationLevel, setEducationLevel] = useState<string>("");
  const [subject, setSubject] = useState<string>("");

  const levels = [
    { id: "middle_school", label: "Middle School (Grades 6-8)", icon: "🎒" },
    { id: "high_school", label: "High School (Grades 9-12)", icon: "📐" },
    { id: "college", label: "College / University Undergraduate", icon: "🏛️" },
    { id: "postgrad", label: "Postgrad / Professional Research", icon: "🔬" },
  ];

  const subjects = [
    { id: "maths", label: "Mathematics & Algebra", icon: "🧮" },
    { id: "physics", label: "Physics & Astronomy", icon: "🌌" },
    { id: "chemistry", label: "Chemistry & Biology", icon: "🧪" },
    { id: "computer_science", label: "Computer Science & AI", icon: "💻" },
    { id: "humanities", label: "History & Literature", icon: "✒️" },
  ];

  const handleNext = () => {
    if (step === 0 && userName.trim() === "") {
      // Just put default "Learner" if submitted blank or user hits space
      return;
    }
    if (step < 2) {
      setStep((prev) => prev + 1);
    } else {
      onComplete({
        name: userName.trim() || "Student",
        level: educationLevel || "High School",
        subject: subject || "General Study",
        isCompleted: true,
      });
    }
  };

  const currentStepData = () => {
    switch (step) {
      case 0:
        return {
          title: "Let's personalize your learning!",
          desc: "Before we begin our school journey, what should StudyBuddy AI call you?",
          placeholder: "Enter your name...",
        };
      case 1:
        return {
          title: "Select your school level",
          desc: "I will adapt my explanations, formulas, and terminology to fit your academic stage.",
        };
      case 2:
        return {
          title: "What is your main subject of interest?",
          desc: "I will tailor our quizzes, homework targets, and deep explanation paths to match.",
        };
      default:
        return { title: "", desc: "" };
    }
  };

  const activeLevelData = levels.find(l => l.id === educationLevel);
  const activeSubjectData = subjects.find(s => s.id === subject);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-lg glass-panel text-slate-800 rounded-3xl shadow-xl overflow-hidden relative border border-slate-200 bg-white">
        
        {/* Ambient absolute glows */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header / Progress Bar */}
        <div className="px-6 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-indigo-600 animate-pulse" />
            <span className="font-display font-semibold tracking-wider text-xs uppercase text-indigo-600">
              StudyBuddy AI
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-6 bg-indigo-600" : s < step ? "w-3 bg-indigo-200" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Onboarding Wizard Body */}
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Step {step + 1} of 3
                </span>
                <h1 className="text-2xl font-display font-semibold text-slate-900 tracking-tight">
                  {currentStepData().title}
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed font-sans">
                  {currentStepData().desc}
                </p>
              </div>

              {/* Step Renderers */}
              {step === 0 && (
                <div className="relative group/input">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="onboarding-name-input"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={currentStepData().placeholder}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    autoFocus
                    className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl py-4 pl-12 pr-4 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-base"
                    maxLength={30}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {levels.map((lvl) => (
                    <button
                      id={`onboarding-level-${lvl.id}`}
                      key={lvl.id}
                      onClick={() => setEducationLevel(lvl.label)}
                      className={`w-full flex items-center justify-between text-left p-4 rounded-2xl transition-all border ${
                        educationLevel === lvl.label
                          ? "bg-indigo-50 border-indigo-500/80 shadow-[0_2px_8px_rgba(99,102,241,0.08)] text-indigo-900"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/65 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lvl.icon}</span>
                        <span className="text-sm font-sans font-medium">{lvl.label}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        educationLevel === lvl.label ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                      }`}>
                        {educationLevel === lvl.label && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                  {subjects.map((sub) => (
                    <button
                      id={`onboarding-subject-${sub.id}`}
                      key={sub.id}
                      onClick={() => setSubject(sub.label)}
                      className={`w-full flex items-center justify-between text-left p-4 rounded-2xl transition-all border ${
                        subject === sub.label
                          ? "bg-indigo-50 border-indigo-500/80 shadow-[0_2px_8px_rgba(99,102,241,0.08)] text-indigo-900"
                          : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/65 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{sub.icon}</span>
                        <span className="text-sm font-sans font-medium">{sub.label}</span>
                      </div>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                        subject === sub.label ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                      }`}>
                        {subject === sub.label && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              id="onboarding-skip-btn"
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            >
              Skip Onboarding
            </button>

            <button
              id="onboarding-next-btn"
              onClick={handleNext}
              disabled={
                (step === 0 && userName.trim() === "") ||
                (step === 1 && !educationLevel) ||
                (step === 2 && !subject)
              }
              className={`flex items-center gap-2 font-display font-medium text-sm px-6 py-3 rounded-2xl transition-all cursor-pointer ${
                ((step === 0 && userName.trim() !== "") ||
                (step === 1 && educationLevel) ||
                (step === 2 && subject))
                  ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {step < 2 ? "Continue" : "Get Started"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
