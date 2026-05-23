import React, { useState, useEffect, useRef } from "react";
import Onboarding from "./components/Onboarding";
import Sidebar from "./components/Sidebar";
import MessageItem from "./components/MessageItem";
import { Message, OnboardingContext, Homework, MCQ } from "./types";
import { 
  Send, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  X, 
  Bot, 
  GraduationCap, 
  AlertCircle,
  Sparkles,
  Award,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  // --- Persistent Gamified Profile States ---
  const [onboarding, setOnboarding] = useState<OnboardingContext>(() => {
    const saved = localStorage.getItem("studybuddy_onboarding");
    return saved ? JSON.parse(saved) : { name: "", level: "", subject: "", isCompleted: false };
  });

  const [xp, setXP] = useState<number>(() => {
    const saved = localStorage.getItem("studybuddy_xp");
    return saved ? parseInt(saved, 10) : 100; // Starting XP gift
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("studybuddy_streak");
    return saved ? parseInt(saved, 10) : 3; // Initial mock streak
  });

  const [quizzesSolved, setQuizzesSolved] = useState<number>(() => {
    const saved = localStorage.getItem("studybuddy_quizzes");
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- Core Application States ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeHomeworks, setActiveHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize initial welcome package
  useEffect(() => {
    const savedMessages = localStorage.getItem("studybuddy_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const welcomeMsg: Message = {
        id: "sys-welcome",
        role: "model",
        content: `🎓 **Welcome to StudyBuddy AI!** I am StudyBuddy AI, your personal study assistant here to help you learn.\n\nI can help break down complex subjects, analyze mathematical formulation steps, explain hard concepts, and run interactive exam quizzes!\n\n**🎒 How to study today:**\n* Write a conceptual question in the chat below.\n* Tap any of the floating **follow-up suggested study questions**.\n* Upload pictures of homework questions, notes, or test graphs using the **Image button** 📷 or simply drop files here!`,
        suggestions: [
          "Check my general mathematics slope mastery",
          "Explain the Spaced Repetition system",
          "Test my science recall with an MCQ"
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages([welcomeMsg]);
    }

    const savedHomeworks = localStorage.getItem("studybuddy_homeworks");
    if (savedHomeworks) {
      setActiveHomeworks(JSON.parse(savedHomeworks));
    }
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem("studybuddy_onboarding", JSON.stringify(onboarding));
  }, [onboarding]);

  useEffect(() => {
    localStorage.setItem("studybuddy_xp", xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem("studybuddy_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("studybuddy_quizzes", quizzesSolved.toString());
  }, [quizzesSolved]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("studybuddy_messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("studybuddy_homeworks", JSON.stringify(activeHomeworks));
  }, [activeHomeworks]);

  // Scroll to bottom on new message additions
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // --- Handlers & Functionalities ---

  // Handle onboarding submission
  const handleOnboardingComplete = (context: OnboardingContext) => {
    setOnboarding(context);
    addXp(50); // Welcome XP bonus
    // Inject personalized tutoring startup message
    const personalWelcome: Message = {
      id: `sys-personal-${Date.now()}`,
      role: "model",
      content: `👋 **Hello ${context.name}!** I have custom-tuned my curriculum filters for your profile (*${context.level}* level studying *${context.subject}*).\n\nWhat would you like to review or explore first? Feel free to upload textbook snaps or ask any query you have!`,
      suggestions: [
        `Explain a core concept in ${context.subject}`,
        `Give me a quiz challenge for ${context.level}`,
        `Assign simple study homework`
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages((prev) => [...prev, personalWelcome]);
  };

  // Skip onboarding
  const handleOnboardingSkip = () => {
    setOnboarding({
      name: "Student",
      level: "High School",
      subject: "General Studies",
      isCompleted: true
    });
  };

  // Add gamified Experience Points
  const addXp = (amount: number) => {
    setXP((prev) => prev + amount);
  };

  // Full reset to clear settings
  const handleFullReset = () => {
    localStorage.removeItem("studybuddy_onboarding");
    localStorage.removeItem("studybuddy_xp");
    localStorage.removeItem("studybuddy_streak");
    localStorage.removeItem("studybuddy_quizzes");
    localStorage.removeItem("studybuddy_messages");
    localStorage.removeItem("studybuddy_homeworks");
    
    setOnboarding({ name: "", level: "", subject: "", isCompleted: false });
    setXP(100);
    setStreak(1);
    setQuizzesSolved(0);
    setActiveHomeworks([]);
    const welcomeMsg: Message = {
      id: "sys-welcome",
      role: "model",
      content: `🎓 **Welcome to StudyBuddy AI!** I am StudyBuddy AI, your personal study assistant here to help you learn.\n\nI can help break down complex subjects, analyze mathematical formulation steps, explain hard concepts, and run interactive exam quizzes!\n\n**🎒 How to study today:**\n* Write a conceptual question in the chat below.\n* Tap any of the floating **follow-up suggested study questions**.\n* Upload pictures of homework questions, notes, or test graphs using the **Image button** 📷 or simply drop files here!`,
      suggestions: [
        "Check my general mathematics slope mastery",
        "Explain the Spaced Repetition system",
        "Test my science recall with an MCQ"
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setMessages([welcomeMsg]);
    setSelectedImage(null);
    setInputText("");
    setErrorMessage(null);
  };

  // Convert uploaded image file to Base64 format
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select or drop image files only.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUploadEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Drag and drop event tracking
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Submit study prompt to the server
  const handleSendMessage = async (textToSend?: string) => {
    const textQuery = (textToSend || inputText).trim();
    if (!textQuery && !selectedImage) return;

    // Clear compiler composer input
    setInputText("");
    setErrorMessage(null);

    // Track active image reference locally and reset selection thumbnail
    const fileBase64 = selectedImage;
    setSelectedImage(null);

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Build the user message object
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textQuery,
      image: fileBase64 || undefined,
      timestamp: timeNow
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setProgressStatus("StudyBuddy AI is reviewing your study question...");

    // Periodic delays tracker to update loader texts
    const statusTexts = [
      "Reviewing visual details and diagrams...",
      "Matching formulas with student level...",
      "Formulating complete step-by-step notes...",
      "Crafting diagnostic evaluation quizzes..."
    ];
    let stepCount = 0;
    const loaderInterval = setInterval(() => {
      if (stepCount < statusTexts.length) {
        setProgressStatus(statusTexts[stepCount]);
        stepCount++;
      }
    }, 2800);

    try {
      const payload = {
        messages: messages.slice(-10), // Pass the last 10 conversation turns for context
        currentPrompt: textQuery,
        image: fileBase64,
        onboardingContext: onboarding
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to consult AI. Server responded with: ${response.status}`);
      }

      const responseData = await response.json();

      clearInterval(loaderInterval);

      // Create model message reply
      const modelReply: Message = {
        id: `model-${Date.now()}`,
        role: "model",
        content: responseData.text || "I was unable to formulate a learning summary. Could you try asking otherwise?",
        suggestions: responseData.suggestions || [],
        mcq: responseData.mcq || undefined,
        homework: responseData.homework || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, modelReply]);
      
      // If there is homework, register it into sidebar highlights
      if (responseData.homework) {
        setActiveHomeworks((prev) => {
          const exists = prev.some(h => h.title === responseData.homework.title);
          if (exists) return prev;
          return [responseData.homework, ...prev];
        });
        addXp(10); // Reward for triggering homework challenges!
      }

      // Add small reward points for completing chat segments
      addXp(15);

    } catch (err: any) {
      clearInterval(loaderInterval);
      console.error("Failed to solve homework chat query:", err);
      setErrorMessage("⚠️ StudyBuddy is temporarily experiencing high tutor traffic. Click inside any smart suggestions below to retry!");
    } finally {
      setIsLoading(false);
      setProgressStatus("");
    }
  };

  // Handle MCQ selection answer
  const handleUpdateMCQ = (messageId: string, updatedMCQ: MCQ, points: number) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, mcq: updatedMCQ } : msg))
    );

    if (points > 0) {
      addXp(points);
      setQuizzesSolved((p) => p + 1);
    }
  };

  // Handle Homework Response Submission
  const handleUpdateHomework = (messageId: string, updatedHomework: Homework, points: number) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, homework: updatedHomework } : msg))
    );

    // Also update corresponding homework in sidebar list
    setActiveHomeworks((prev) =>
      prev.map((hw) => (hw.title === updatedHomework.title ? updatedHomework : hw))
    );

    if (points > 0) {
      addXp(points);
    }
  };

  // Sidebar clicking on homework scrolls and sets focus
  const handleSelectHomework = (hw: Homework) => {
    // Find message relating to homework title or ask AI to solve it
    const mathMsg = messages.find(m => m.homework?.title === hw.title);
    if (mathMsg) {
      // Elegant scrolling directly to that item
      const itemNode = document.getElementById(`sug-chip-${mathMsg.id}-0`);
      if (itemNode) {
        itemNode.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      handleSendMessage(`Help me study and complete this assignment challenge: "${hw.title}" - ${hw.description}`);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans select-none"
    >
      {/* Immersive subtle background shapes */}
      <div className="absolute top-1/6 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full bg-indigo-50/40 z-0 pointer-events-none blur-3xl" />
      <div className="absolute bottom-1/6 right-1/4 translate-y-1/2 translate-x-1/2 w-[650px] h-[650px] rounded-full bg-indigo-50/20 z-0 pointer-events-none blur-3xl" />

      {/* Screen drag drop utility overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 border-4 border-dashed border-indigo-550 m-4 rounded-3xl"
          >
            <Bot className="h-20 w-20 text-indigo-600 animate-bounce mb-4" />
            <h2 className="text-3xl font-display font-bold text-slate-800 tracking-tight">Drop files/images to analyze!</h2>
            <p className="text-slate-500 text-sm font-sans mt-2">StudyBuddy will scan study guides, chalkboard photos, and homework capture documents.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Branding on mobile */}
      <header className="lg:hidden p-4 border-b border-slate-200 bg-white flex items-center justify-between glass-panel z-10">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-indigo-600" />
          <h2 className="font-display font-bold text-sm tracking-tight text-slate-800">StudyBuddy AI</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-bold">⚡ {xp} XP</span>
          <span className="text-xs text-slate-500 font-semibold font-sans">🔥 {streak} Days</span>
        </div>
      </header>

      {/* Main Framework Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 md:py-6 flex flex-col lg:flex-row gap-6 items-stretch relative z-10 h-[calc(100vh-80px)] lg:h-screen">
        
        {/* Onboarding Wizard popup blocker */}
        {!onboarding.isCompleted ? (
          <div className="flex-1 flex items-center justify-center">
            <Onboarding 
              onComplete={handleOnboardingComplete} 
              onSkip={handleOnboardingSkip} 
            />
          </div>
        ) : (
          <>
            {/* Embedded Left Navigation Workspace Tracker */}
            <div className="hidden lg:block shrink-0 h-full">
              <Sidebar 
                onboarding={onboarding}
                xp={xp}
                streak={streak}
                quizzesSolved={quizzesSolved}
                activeHomeworks={activeHomeworks}
                onReset={handleFullReset}
                onSelectHomework={handleSelectHomework}
              />
            </div>

            {/* Main Interactive Chat Panel */}
            <div className="flex-1 flex flex-col justify-between glass-panel rounded-2xl border border-slate-200 bg-white h-full overflow-hidden shadow-xs relative">
              
              {/* Top Subject Subheader */}
              <div className="px-6 py-4 border-b border-slate-100 bg-[#FAF9F6]/20 flex items-center justify-between select-text shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <span className="text-xs text-slate-400 font-sans block leading-none mb-0.5">Currently Studying</span>
                    <span className="text-sm font-semibold font-display text-slate-800">{onboarding.subject || "General Science"} Helper</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-1 text-xs text-indigo-600">
                    <Award className="h-4 w-4 text-indigo-500" />
                    <span className="font-semibold font-sans">Academic level: {onboarding.level || "High School"}</span>
                  </div>
                  {/* Small Reset backup directly inside chat panel for quick triggers */}
                  <button 
                    id="chat-reset-btn"
                    onClick={handleFullReset}
                    className="text-slate-400 hover:text-slate-700 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="Start fresh"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Chat Message Lists Display Frame */}
              <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-6 py-6 space-y-6 select-text"
              >
                {messages.map((msg) => (
                  <MessageItem 
                    key={msg.id}
                    message={msg}
                    onSelectSuggestion={(sug) => { handleSendMessage(sug); }}
                    onUpdateMCQ={handleUpdateMCQ}
                    onUpdateHomework={handleUpdateHomework}
                  />
                ))}

                {/* Animated Typing Thinker Bubble */}
                {isLoading && (
                  <div className="flex flex-col gap-2 items-start mt-2">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-[9px] shadow-xs animate-spin-[spin_3s_linear_infinite]">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[9px] font-display font-bold uppercase tracking-widest text-[#6366f1] animate-pulse">
                        {progressStatus || "StudyBuddy AI is thinking..."}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-2xl rounded-tl-none px-5 py-3.5 border border-slate-200/60 flex gap-1 items-center shadow-xs">
                      <div className="w-2 h-2 rounded-full bg-indigo-550/80 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-550/80 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-indigo-550/80 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}

                {/* Network failure error box details */}
                {errorMessage && (
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3 mt-4 text-xs text-rose-800">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold font-display text-rose-800">Study Tutoring Connection Issue</h4>
                      <p className="leading-relaxed font-sans mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating composer Area */}
              <div className="p-4 md:p-6 border-t border-slate-100 space-y-3 shrink-0 relative bg-white">
                
                {/* Floating file thumbnail above row */}
                {selectedImage && (
                  <div className="absolute bottom-full left-6 mb-4 p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-md select-none text-slate-700">
                    <div className="h-10 w-10 rounded overflow-hidden border border-slate-200 shrink-0">
                      <img src={selectedImage} alt="Scanning source preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-600 font-bold font-sans">1 attached file selected</p>
                      <p className="text-[9px] text-slate-500 leading-tight">Ready to analyze screen capture</p>
                    </div>
                    <button 
                      id="remove-attached-btn"
                      onClick={() => setSelectedImage(null)}
                      className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Chat Composer Bar Structure */}
                <div className="flex items-center gap-3 relative">
                  
                  {/* Hidden input file connector */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUploadEvent}
                    className="hidden"
                  />

                  {/* Prominent Image attachment button */}
                  <button
                    id="attachment-trigger-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attachment homework screenshot"
                    className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                  >
                    <ImageIcon className="h-5 w-5" />
                  </button>

                  <div className="flex-1 relative group">
                    <input
                      id="composer-input-field"
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Ask any school, homework, formula, or textbook question..."
                      disabled={isLoading}
                      autoFocus
                      className="w-full h-12 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl pl-4 pr-12 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-150 text-sm md:text-base leading-none transition-all font-sans"
                    />

                    {/* Submit icon trigger */}
                    <button
                      id="composer-submit-btn"
                      onClick={() => handleSendMessage()}
                      disabled={isLoading || (!inputText.trim() && !selectedImage)}
                      className={`absolute right-2 top-1.5 h-9 w-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        inputText.trim() !== "" || selectedImage
                          ? "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 hover:scale-[1.02]"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Little legal status tracker */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans px-1 pt-1">
                  <span>🚀 Tip: Drop images directly inside the screen to analyze graphs!</span>
                  <span>Powered by Gemini 3.5 Flash</span>
                </div>
              </div>

            </div>
          </>
        )}

      </main>

      {/* Embedded statistics panel footer on mobile devices */}
      {onboarding.isCompleted && (
        <footer className="lg:hidden p-4 border-t border-white/5 text-center bg-slate-900/40 select-text shrink-0">
          <button 
            id="mobile-reset-btn"
            onClick={handleFullReset}
            className="text-xs text-rose-400 font-semibold font-sans italic hover:underline"
          >
            Clear Profile & Reset
          </button>
        </footer>
      )}
    </div>
  );
}
