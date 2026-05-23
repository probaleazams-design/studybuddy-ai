import React, { useState, useEffect } from "react";
import { Message, MCQ, Homework } from "../types";
import { GraduationCap, Sparkles, Send, CheckCircle2, Clock, Check, X, AlertTriangle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MessageItemProps {
  key?: any;
  message: Message;
  onSelectSuggestion: (suggestion: string) => void;
  onUpdateMCQ: (messageId: string, updatedMCQ: MCQ, pointsEarned: number) => void;
  onUpdateHomework: (messageId: string, updatedHomework: Homework, pointsEarned: number) => void;
}

// Custom Markdown + Math / LaTeX Parser
function renderMarkdownAndMath(text: string) {
  if (!text) return null;

  // Split content by $$ boundary to isolate block equations
  const blockParts = text.split("$$");
  return blockParts.map((block, idx) => {
    if (idx % 2 === 1) {
      // Render as display block math
      return (
        <div key={`math-block-${idx}`} className="math-block text-center flex items-center justify-center my-3 relative group text-sm md:text-base">
          <span className="text-xs uppercase absolute left-2 top-1 text-indigo-400 font-mono scale-90">Equation Block</span>
          <span className="py-2 inline-block font-mono font-medium max-w-full overflow-x-auto select-all select-indigo-500">
            {block.trim()}
          </span>
        </div>
      );
    } else {
      // Inside non-equation segments, divide by inline math "$" boundary
      const inlineParts = block.split("$");
      return (
        <span key={`text-block-${idx}`}>
          {inlineParts.map((inlineSegment, inlineIdx) => {
            if (inlineIdx % 2 === 1) {
              return (
                <code key={`math-inline-${inlineIdx}`} className="math-inline select-all text-xs font-mono font-medium shadow-xs">
                  {inlineSegment}
                </code>
              );
            } else {
              // Convert general markdown syntax like paragraphs, bolds, and bullet trails
              return renderSimpleMarkdown(inlineSegment);
            }
          })}
        </span>
      );
    }
  });
}

function renderSimpleMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    if (line.trim() === "") {
      return <div key={idx} className="h-2" />;
    }

    let isBullet = false;
    let cleanLine = line;

    // Support standard lists like "*" or "-" or digits like "1."
    if (line.trim().startsWith("* ")) {
      isBullet = true;
      cleanLine = line.trim().substring(2);
    } else if (line.trim().startsWith("- ")) {
      isBullet = true;
      cleanLine = line.trim().substring(2);
    }

    // Bold parsing using "**" format
    const boldParts = cleanLine.split("**");
    const formattedLine = boldParts.map((part, bIdx) => {
      if (bIdx % 2 === 1) {
        return <strong key={bIdx} className="font-bold tracking-wide text-inherit">{part}</strong>;
      }
      return part;
    });

    if (isBullet) {
      return (
        <li key={idx} className="ml-4 pl-1 list-none font-sans text-inherit leading-relaxed my-1.5 flex items-start gap-2">
          <span className="text-indigo-500 mt-1.5 shrink-0 block w-1.5 h-1.5 rounded-full bg-indigo-550" />
          <div className="flex-1">{formattedLine}</div>
        </li>
      );
    }

    return (
      <p key={idx} className="my-1.5 font-sans text-inherit leading-relaxed break-words text-sm md:text-[15px]">
        {formattedLine}
      </p>
    );
  });
}

export default function MessageItem({
  message,
  onSelectSuggestion,
  onUpdateMCQ,
  onUpdateHomework
}: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      
      {/* Sender Header Block */}
      <div className="flex items-center gap-2 px-1">
        {!isUser && (
          <div className="h-6 w-6 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[10px] shadow-[0_0_6px_rgba(99,102,241,0.2)]">
            <GraduationCap className="h-3 w-3" />
          </div>
        )}
        <span className="text-[10px] font-display font-medium uppercase tracking-widest text-slate-400">
          {isUser ? "You (Student)" : "StudyBuddy AI"}
        </span>
        <span className="text-[9px] text-slate-500 font-mono">
          {message.timestamp}
        </span>
      </div>

      {/* Message Text Bubble Panel */}
      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xs border relative transition-all duration-300 ${
          isUser
            ? "bg-[#6366F1] border-[#6366F1] text-white rounded-tr-none"
            : "bg-white border-slate-200 text-slate-800 rounded-tl-none"
        }`}
      >
        {/* Render base64 image if attached to user prompt */}
        {isUser && message.image && (
          <div className="mb-3 max-w-sm rounded-lg overflow-hidden border border-white/10 shadow-md">
            <img src={message.image} alt="User Uploaded Document" className="w-full h-auto object-cover max-h-56" referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Formatted body content */}
        <div className="space-y-1">
          {renderMarkdownAndMath(message.content)}
        </div>

        {/* MCQ Interactive Evaluation Widget */}
        {!isUser && message.mcq && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <MCQWidget
              mcq={message.mcq}
              onAnswer={(points, updatedMCQ) => {
                onUpdateMCQ(message.id, updatedMCQ, points);
              }}
            />
          </div>
        )}

        {/* Homework Task Assignment Widget */}
        {!isUser && message.homework && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <HomeworkWidget
              homework={message.homework}
              onSubmit={(points, updatedHomework) => {
                onUpdateHomework(message.id, updatedHomework, points);
              }}
            />
          </div>
        )}
      </div>

      {/* Suggestion Follow-up Question Chips (Render only on newest Model response) */}
      {!isUser && message.suggestions && message.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-1 max-w-[90%]">
          {message.suggestions.map((sug, i) => (
            <motion.button
              id={`sug-chip-${message.id}-${i}`}
              key={i}
              whileHover={{ scale: 1.02, y: -0.5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSuggestion(sug)}
              className="text-xs font-sans font-semibold text-slate-600 px-4 py-2 border border-slate-200 bg-[#F1F5F9] hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-indigo-500" />
              {sug}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

/* MCQ Interactive Helper Subcomponent */
interface MCQWidgetProps {
  mcq: MCQ;
  onAnswer: (score: number, updatedMCQ: MCQ) => void;
}
function MCQWidget({ mcq, onAnswer }: MCQWidgetProps) {
  const [secLeft, setSecLeft] = useState<number>(30);
  const isAnswered = mcq.selectedOptionIndex !== undefined;
  const isExpired = mcq.timerExpired || false;

  useEffect(() => {
    // If already selection or timer expired, freeze interval
    if (isAnswered || isExpired) return;

    const runTimer = setInterval(() => {
      setSecLeft((prev) => {
        if (prev <= 1) {
          clearInterval(runTimer);
          onAnswer(0, {
            ...mcq,
            timerExpired: true,
            selectedOptionIndex: -1 // signify no option chosen
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(runTimer);
  }, [isAnswered, isExpired, mcq]);

  const selectOption = (idx: number) => {
    if (isAnswered || isExpired) return;
    const isCorrect = idx === mcq.correctAnswerIndex;
    onAnswer(isCorrect ? 100 : 0, {
      ...mcq,
      selectedOptionIndex: idx
    });
  };

  return (
    <div className="p-4 rounded-xl border border-slate-150 bg-[#F8FAFC] space-y-3 relative overflow-hidden">
      
      {/* Countdown Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold font-sans">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Active Learning Pop Quiz</span>
        </div>

        {/* Rotational Countdown Dial */}
        {!isAnswered && !isExpired ? (
          <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold font-mono bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-spin-[spin_3s_linear_infinite]" />
            <span>0:{secLeft < 10 ? `0${secLeft}` : secLeft}s</span>
          </div>
        ) : isExpired && mcq.selectedOptionIndex === -1 ? (
          <div className="text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1 font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Time's Up!</span>
          </div>
        ) : (
          <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 font-sans font-semibold">
            <Check className="w-3.5 h-3.5" />
            <span>Completed (+100 XP)</span>
          </div>
        )}
      </div>

      {/* Question Text */}
      <h4 className="text-sm font-semibold font-display text-slate-800 mt-1">
        {mcq.question}
      </h4>

      {/* Options Stack Grid */}
      <div className="space-y-2 mt-2">
        {mcq.options.map((opt, i) => {
          const isSelected = mcq.selectedOptionIndex === i;
          const isActualCorrect = mcq.correctAnswerIndex === i;
          
          let buttonStyles = "bg-white border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-700";
          let badgeIcon = null;

          if (isAnswered || isExpired) {
            if (isActualCorrect) {
              buttonStyles = "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold";
              badgeIcon = <Check className="w-4 h-4 text-emerald-600" />;
            } else if (isSelected) {
              buttonStyles = "bg-rose-50 border-rose-300 text-rose-800 font-semibold";
              badgeIcon = <X className="w-4 h-4 text-rose-600" />;
            } else {
              buttonStyles = "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed";
            }
          }

          return (
            <button
              id={`option-btn-${i}`}
              key={i}
              onClick={() => selectOption(i)}
              disabled={isAnswered || isExpired}
              className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm font-sans flex items-center justify-between transition-all ${
                !isAnswered && !isExpired ? "hover:translate-x-1 cursor-pointer" : ""
              } ${buttonStyles}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center border border-slate-250 text-[10px] font-mono font-bold shrink-0 text-slate-600">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="leading-tight">{opt}</span>
              </div>
              {badgeIcon}
            </button>
          );
        })}
      </div>

      {/* Post Evaluation Explanatory Trail */}
      <AnimatePresence>
        {(isAnswered || isExpired) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="pt-3 border-t border-slate-150 text-xs font-sans text-slate-600 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 font-bold font-display text-slate-700">
              <span>💡 Explanation:</span>
            </div>
            <p className="leading-relaxed text-slate-500">{mcq.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Homework Submission Widget Subcomponent */
interface HomeworkWidgetProps {
  homework: Homework;
  onSubmit: (score: number, updatedHomework: Homework) => void;
}
function HomeworkWidget({ homework, onSubmit }: HomeworkWidgetProps) {
  const [response, setResponse] = useState<string>("");
  const isSubmitted = homework.isCompleted || false;

  const handleSub = () => {
    if (response.trim() === "" || isSubmitted) return;
    onSubmit(50, {
      ...homework,
      submittedAnswer: response.trim(),
      isCompleted: true
    });
  };

  return (
    <div className="p-4 rounded-xl border border-indigo-100 bg-[#EEF2FF]/55 space-y-3 relative">
      <div className="absolute top-2 right-3 flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-indigo-100 border border-indigo-200 font-sans font-bold text-indigo-700">
        📚 Core Homework Task
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold font-display text-slate-800">
          {homework.title}
        </h4>
        <p className="text-xs text-slate-650 leading-relaxed font-sans pr-24">
          {homework.description}
        </p>
      </div>

      {!isSubmitted ? (
        <div className="space-y-2 mt-3">
          <textarea
            id="homework-response-area"
            rows={3}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Write your study response summary here..."
            className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:outline-none focus:border-indigo-500 rounded-lg p-3 text-xs md:text-sm text-slate-800 placeholder-slate-400 transition-colors"
          />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-indigo-600 font-extrabold font-sans">Bounty: {homework.points || "+50 XP"}</span>
            <button
              id="homework-submit-btn"
              onClick={handleSub}
              disabled={response.trim() === ""}
              className={`px-4 py-2 rounded-lg text-xs font-display font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                response.trim() !== ""
                  ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 hover:scale-[1.01]"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Send className="w-3 h-3" />
              Submit Homework
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold font-sans">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Homework Completed! (+50 XP Earned)</span>
          </div>
          <div className="text-xs font-sans text-slate-600 italic">
            Your Submissions: "{homework.submittedAnswer}"
          </div>
        </div>
      )}
    </div>
  );
}
