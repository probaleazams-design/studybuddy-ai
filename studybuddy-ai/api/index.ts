import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini API client is initialized server-side only
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is not defined in the environment. Chat helper will run with offline tutoring capabilities.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini API Client:", err);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max body limit to allow image uploads (base64 strings)
  app.use(express.json({ limit: "25mb" }));

  // API routes first
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", apiConfigured: !!ai });
  });

  // Main educational chat endpoint
  app.post("/api/chat", async (req, res) => {
    const { messages, currentPrompt, image, onboardingContext } = req.body;

    // Validate inputs
    if (!currentPrompt && !image) {
      return res.status(400).json({ error: "No prompt or media provided." });
    }

    // Build the system instructions for the educational assistant
    let systemInstruction = 
      "You are 'StudyBuddy AI', a premium, highly encouraging, and intelligent personal study assistant here to help the user learn. " +
      "You strictly focus 100% on educational aid, homework analysis, mathematics breakdowns, scientific explanations, history, and active learning support. " +
      "You must NEVER mention Google, OpenAI, Gemini, or being a Broad LLM / Large Language Model. " +
      "Your first introductory response message must begin with or strictly include: 'I am StudyBuddy AI, your personal study assistant here to help you learn.' " +
      "For Mathematics, Physics, Chemistry, and engineering queries, you must provide thorough step-by-step breakdowns with clear, clean mathematical formulas. " +
      "Structure your response text with beautiful markdown formatting and multiple emojis for bullets, labels, and summaries to keep it visual and engaging for students. " +
      "If the user uploaded an image, analyze it thoroughly to give descriptive explanations, locate math problems, or identify visual diagrams. " +
      "To foster active learning:\n" +
      "1. You must periodically quiz the user to test their understanding. When doing so, populate the `mcq` object in the JSON schema with exactly 4 options, a 0-based correctAnswerIndex, and a clear encouraging explanation.\n" +
      "2. For a thorough learning session or deep-dives, you can optionally assign a mini homework assignment in the `homework` schema to motivate the user.\n" +
      "3. Always generate exactly 3 contextual, clickable follow-up study questions in the `suggestions` array.";

    if (onboardingContext) {
      const { name, level, subject } = onboardingContext;
      systemInstruction += `\n\nUser Context:\n- Student Name: ${name || "Learner"}\n- Educational Level: ${level || "High School"}\n- Subject of Interest: ${subject || "General Science & Maths"}. Tailor your terminology, examples, difficulty level, and tone to suit this profile perfectly. Call the user by their name (${name}) occasionally in a friendly way.`;
    }

    // Construct request contents
    const contents: any[] = [];

    // Map history to proper Gemini contents structure
    if (messages && Array.isArray(messages)) {
      messages.forEach((msg: any) => {
        // Only map non-system messages to standard turn formats
        if (msg.role === "user" || msg.role === "model") {
          contents.push({
            role: msg.role,
            parts: [{ text: msg.text || msg.content || "" }]
          });
        }
      });
    }

    // Add current user prompt (containing image if any)
    const currentParts: any[] = [];
    if (image && typeof image === "string") {
      // Find MIME type from base64 header
      const match = image.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/);
      const mimeType = match ? match[1] : "image/jpeg";
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, "");
      
      currentParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    currentParts.push({ text: currentPrompt || "Help me analyze this!" });

    contents.push({
      role: "user",
      parts: currentParts
    });

    if (ai) {
      try {
        console.log("Sending prompt to Gemini SDK... System instruction length:", systemInstruction.length);
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "Engaging response content in formatted Markdown. Include emojis, clear step-by-step descriptions, bullet lists, and nice clean mathematical equations."
                },
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 3 distinct, contextually relevant, clickable follow-up study questions."
                },
                mcq: {
                  type: Type.OBJECT,
                  description: "Optional MCQ quiz object to gauge if they understood. Include question, 4 options, correctAnswerIndex, and explanation.",
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING }
                  },
                  required: ["question", "options", "correctAnswerIndex", "explanation"]
                },
                homework: {
                  type: Type.OBJECT,
                  description: "Optional educational homework card task.",
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    points: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              },
              required: ["text", "suggestions"]
            }
          }
        });

        const replyText = response.text;
        if (replyText) {
          try {
            const parsedData = JSON.parse(replyText.trim());
            return res.json(parsedData);
          } catch (jsonErr) {
            console.error("Gemini returned invalid JSON string:", replyText);
            // Fallback and try wrapping it
            return res.json({
              text: replyText,
              suggestions: [
                "Can you elaborate on that?",
                "Give me a real-world example.",
                "How does this relate to school homework?"
              ]
            });
          }
        } else {
          throw new Error("Empty response text returned from Gemini API");
        }
      } catch (err: any) {
        console.error("Gemini API Error details:", err);
        return res.status(500).json({
          error: "Gemini API failure",
          message: err.message || "Unknown error occurred",
          fallback: true
        });
      }
    } else {
      // Offline fallback simulator to let the application run flawlessly even if API key is not yet configured.
      console.log("Gemini API not initialized (missing API key). Using offline high-fidelity simulator.");
      
      // Simulate real-time logic response based on query keywords
      const promptLower = (currentPrompt || "").toLowerCase();
      let simResponseText = `🎓 **Class is in Session!** I am StudyBuddy AI, your personal study assistant here to help you learn. \n\nI noticed you queried: *"**${currentPrompt}**"*. \n\nHere is an interactive study breakdown for you:\n\n### 💡 Key Concept Explorer\n* 🏫 **Educational Context**: StudyBuddy focuses on breaking complex ideas down into bite-sized, digestible lessons.\n* 🔢 **Logical Method**: Whether it's math, physics, or humanities, we learn by applying active recall.\n* 🔬 **Deconstruct**: Always separate the core definition, the active mechanism, and a practical application!\n\nLet's test if you've got this down with a quick practice problem!`;
      
      let simMCQ = {
        question: "Which learning mechanism involves pulling information out of our minds rather than cramming more in?",
        options: [
          "Passive Re-reading",
          "Active Recall",
          "Rote Memorization",
          "Highlighted Underlining"
        ],
        correctAnswerIndex: 1,
        explanation: "Active Recall involves retrieving information from memory, which builds stronger neural connections for long-term retention!"
      };

      let simSuggestions = [
        "How can I use Active Recall for exams?",
        "Explain spaced repetition lists",
        "Give me a math homework practice question"
      ];

      if (promptLower.includes("math") || promptLower.includes("solve") || promptLower.includes("calculate") || /\d+/.test(promptLower)) {
        simResponseText = `📐 **StudyBuddy AI Math Solver!** I am StudyBuddy AI, your personal study assistant here to help you learn.\n\nLet's break down this mathematical concept step-by-step with elegant formulas!\n\n### 🔢 Core Step-by-Step Solution\n\n1. **Step 1: Identify Variables & Equations**\n   We align the equation structure carefully:\n   $$y = mx + c$$\n\n2. **Step 2: Isolate the Unknown**\n   Let's rewrite the target formulation with inverse operations:\n   $$a^2 + b^2 = c^2 \\implies c = \\sqrt{a^2 + b^2}$$\n\n3. **Step 3: Calculate values**\n   Substitute the given values into our model, calculating carefully to ensure logical accuracy.\n\n### 🌟 Pro Math Tip\n*Always double check your units and simplify complex fractions before substituting numbers!* 📝`;
        
        simMCQ = {
          question: "In the linear slope equation y = mx + c, what does the variable 'm' represent?",
          options: [
            "Y-intercept",
            "The Slope/Gradient",
            "X-intercept",
            "Constant Coefficient"
          ],
          correctAnswerIndex: 1,
          explanation: "In y = mx + c, 'm' is the coefficient of x, representing the slope or rate of change of the line!"
        };

        simSuggestions = [
          "Explain slope and intercept visually",
          "Can we solve a quadratic equation step-by-step?",
          "Assign a slope practice homework"
        ];
      } else if (image) {
        simResponseText = `📷 **Visual Document Analyzed!** I am StudyBuddy AI, your personal study assistant here to help you learn.\n\nI have scanned your uploaded file/image. Here is what I detected:\n\n### 🔍 Image Scan Results\n* 📝 **Visual Context**: A study guide diagram, homework sheet, or textbook capture.\n* ⚙️ **Key Insight**: I can see several formulas or terms relating to your subject of interest.\n* 💡 **Tutoring Tip**: Let's isolate the main question from the top-left area of the uploaded sheet.\n\nLet's try a quick general science quiz to check our visual concept mastery!`;
        
        simMCQ = {
          question: "When scanning scientific paper diagrams, which part contains the axis labels representing dependent variables?",
          options: [
            "The horizontal X-Axis",
            "The vertical Y-Axis",
            "The title header",
            "The legend label"
          ],
          correctAnswerIndex: 1,
          explanation: "Normally, the dependent variable is plotted along the vertical Y-axis, while the independent variable is plotted on the X-axis!"
        };

        simSuggestions = [
          "How to read multi-part graphs?",
          "How can I practice diagram analysis?",
          "Assign a homework on variable tracking"
        ];
      }

      // Assign an optional homework occasionally
      const simHomework = {
        title: "⚡ Mind Explorer Challenge",
        description: "Draft a 3-sentence summary of active recall in your own words, and explain how you will apply it to space-out study sessions this week.",
        points: "+80 StudyBuddy XP"
      };

      // Add a small artificial delay to simulate "Thinking..."
      await new Promise(resolve => setTimeout(resolve, 1500));

      return res.json({
        text: simResponseText,
        suggestions: simSuggestions,
        mcq: simMCQ,
        homework: simHomework
      });
    }
  });

  // Vite middleware for development or index fallback for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}
  export default app;
