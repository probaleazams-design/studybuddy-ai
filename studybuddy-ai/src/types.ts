export interface MCQ {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  selectedOptionIndex?: number;
  timerExpired?: boolean;
}

export interface Homework {
  title: string;
  description: string;
  points: string;
  submittedAnswer?: string;
  isCompleted?: boolean;
}

export interface Message {
  id: string;
  role: "user" | "model" | "system";
  content: string; // response.text
  suggestions?: string[];
  image?: string; // base64 representation if sent by user
  mcq?: MCQ;
  homework?: Homework;
  timestamp: string;
}

export interface OnboardingContext {
  name: string;
  level: string; // school, college, levels
  subject: string;
  isCompleted: boolean;
}
