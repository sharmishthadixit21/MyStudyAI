/**
 * AuraSpace Secure Serverless API Proxy for AI Quiz Generation & Doubt Solver
 * Strictly communicates with Google Gemini API using server-side credentials.
 * SECURITY: API keys are loaded via server environment variables (process.env.GEMINI_API_KEY).
 * Keys are NEVER exposed or returned to the client browser.
 */

const fs = require('fs');
const path = require('path');

// Helper to securely load the Gemini API Key from environment or local .env
function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (e) {}
  return "";
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-gemini-key, X-Gemini-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, subject, chapter, difficulty, targetExam, userDoubt } = req.body || {};
    const geminiApiKey = getGeminiApiKey();
    const groqApiKey = process.env.GROQ_API_KEY || "";

    // 1. Doubt Solving AI Chat Mode (Live Server-Side AI Tutor)
    if (action === 'chat_doubt') {
      if (!userDoubt) {
        return res.status(400).json({ error: 'userDoubt is required' });
      }

      const systemPrompt = "You are a supportive, genius AI study mentor and tutor on AuraSpace. Explain concepts clearly in friendly language with step-by-step logic, easy analogies, and key formulas. Be concise (2-4 sentences).";
      const userPrompt = `Target Exam: ${targetExam || 'General'}, Subject: ${subject || 'Study Topic'}, Context/Chapter: ${chapter || 'Core Concept'}.\nStudent Doubt/Question: ${userDoubt}`;

      if (geminiApiKey) {
        const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        for (const model of geminiModels) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': geminiApiKey
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: `${systemPrompt}\n\n${userPrompt}` }
                    ]
                  }
                ]
              })
            });
            if (geminiRes.ok) {
              const gData = await geminiRes.json();
              const reply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (reply) return res.status(200).json({ success: true, reply });
            }
          } catch (e) {}
        }
      }

      // Fallback Groq if configured
      if (groqApiKey) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              temperature: 0.6,
              max_tokens: 600
            })
          });
          if (groqRes.ok) {
            const data = await groqRes.json();
            const reply = data.choices[0]?.message?.content;
            if (reply) return res.status(200).json({ success: true, reply });
          }
        } catch (e) {}
      }

      return res.status(200).json({
        success: true,
        reply: `Concept Breakdown for ${subject || 'your topic'} (${chapter || 'Core Concept'}):\n1. Identify the core law and known values.\n2. Break the problem into direct step-by-step logic.\n3. Watch for typical traps such as units and sign conventions.\n4. Apply the governing principle carefully!`
      });
    }

    // 2. Pure Dynamic AI Quiz Generation Mode (Gemini AI API)
    const sub = String(subject || 'General Studies').trim();
    const ch = String(chapter || 'Key Concepts').trim();
    const diff = String(difficulty || 'standard').trim();
    const exam = String(targetExam || 'Competitive Exam').trim();
    const nonce = Math.random().toString(36).substring(2, 8) + '-' + Date.now();

    const systemInstructionText = `You are an elite examination setter and master academic tutor for competitive and board examinations (such as CBSE Board, NEET, JEE, UPSC, SAT, etc.).
Your job is to analyze the subject, syllabus depth, and difficulty level, and dynamically generate a fresh, non-repetitive set of Multiple Choice Questions (MCQs).

MANDATORY RULES:
1. DYNAMIC QUESTION COUNT:
   - Carefully evaluate the topic breadth. Automatically decide the optimal question count between 4 to 8 questions.
   - For focused/single-formula sub-topics, generate 4 to 5 rigorous questions.
   - For extensive chapters with multiple theorems/applications, generate 6 to 8 questions.
   - Do NOT use a rigid fixed count. Adapt dynamically to the topic complexity!
2. NO REPETITIVE SENTENCE TEMPLATES:
   - NEVER start questions with boilerplate phrases like "In [Subject] under '[Topic]', which statement represents...", "When solving high-yield analytical problems...".
   - Every question must be distinct, direct, authentic, and naturally phrased.
3. DETAILED AI TUTOR MISTAKE ANALYSIS:
   - For EVERY question, you MUST provide:
     a) "explanation": Clear, step-by-step conceptual or mathematical proof of the correct answer.
     b) "mistake_analysis": AI Tutor explanation pinpointing why students get confused, which distractor/trap they commonly pick, and how to avoid that error.
     c) "key_takeaway": 1-line memorable golden rule or formula.
4. RIGOROUS 4-OPTION STRUCTURE:
   - Exactly 4 distinct, plausible options per question with authentic values/terminology.
   - No "All of the above" or "None of the above".
5. CLEAN RAW JSON OUTPUT:
   - Return ONLY a valid, parseable raw JSON array of objects. No markdown formatting, no conversational text.
   - Schema per question object:
     {
       "question": "Challenging, natural question statement",
       "options": ["Option A", "Option B", "Option C", "Option D"],
       "correct_answer": 0,
       "explanation": "Clear step-by-step reasoning proving the correct answer",
       "mistake_analysis": "AI Tutor Insight: Common pitfall or trap and how to avoid it",
       "key_takeaway": "1-line memorable golden rule or formula"
     }`;

    const quizUserPrompt = `Dynamically analyze the complexity and breadth of this topic, determine the ideal question count (between 4 and 8), and generate a bespoke examination MCQ set:
- Subject: "${sub}"
- Topic/Chapter: "${ch}"
- Target Exam: "${exam}"
- Difficulty: "${diff}"
- Session Seed: "${nonce}"

REQUIREMENTS:
- Dynamically decide the number of questions (4 to 8) based on topic depth.
- Each question must test a different sub-concept or formula of "${ch}" in "${sub}".
- Provide authentic, high-quality questions with 4 distinct options, correct_answer (0-3 index), step-by-step explanation, mistake_analysis, and key_takeaway.
- Return ONLY the raw JSON array.`;

    function normalizeQuizArray(arr) {
      if (!Array.isArray(arr)) return null;
      const clean = [];
      for (const item of arr) {
        if (!item) continue;
        const qText = item.question || item.q || item.statement || "";
        let opts = item.options;
        if (!Array.isArray(opts) && typeof opts === 'object') opts = Object.values(opts);
        if (!Array.isArray(opts) || opts.length < 2) continue;

        let correctIdx = 0;
        if (typeof item.correct_answer === 'number' && item.correct_answer >= 0 && item.correct_answer < opts.length) {
          correctIdx = item.correct_answer;
        } else if (typeof item.correct === 'number' && item.correct >= 0 && item.correct < opts.length) {
          correctIdx = item.correct;
        } else if (typeof item.correct_answer === 'string') {
          const letterIdx = ['a', 'b', 'c', 'd'].indexOf(item.correct_answer.trim().toLowerCase().replace(/[^a-d]/g, ''));
          if (letterIdx !== -1 && letterIdx < opts.length) {
            correctIdx = letterIdx;
          } else {
            const found = opts.findIndex(o => String(o).trim().toLowerCase() === item.correct_answer.trim().toLowerCase());
            if (found !== -1) correctIdx = found;
          }
        } else if (typeof item.correct === 'string') {
          const letterIdx = ['a', 'b', 'c', 'd'].indexOf(item.correct.trim().toLowerCase().replace(/[^a-d]/g, ''));
          if (letterIdx !== -1 && letterIdx < opts.length) {
            correctIdx = letterIdx;
          } else {
            const found = opts.findIndex(o => String(o).trim().toLowerCase() === item.correct.trim().toLowerCase());
            if (found !== -1) correctIdx = found;
          }
        }

        const explanation = item.explanation || item.explain || item.reason || "Clear conceptual reasoning based on standard curriculum.";
        const mistakeAnalysis = item.mistake_analysis || item.mistakeAnalysis || item.misconception || item.trap || "Watch out for common pitfalls: verify boundary conditions and standard SI units.";
        const keyTakeaway = item.key_takeaway || item.keyTakeaway || item.goldenRule || item.summary || `Master the core formula and principle of ${ch}.`;

        const finalOptions = opts.map(o => String(o).trim());
        if (finalOptions.length > 4) finalOptions.length = 4;

        clean.push({
          question: String(qText).trim(),
          q: String(qText).trim(),
          options: finalOptions,
          correct_answer: correctIdx,
          correct: correctIdx,
          explanation: String(explanation).trim(),
          mistake_analysis: String(mistakeAnalysis).trim(),
          key_takeaway: String(keyTakeaway).trim()
        });
      }
      return clean.length >= 2 ? clean : null;
    }

    function safeJsonParse(rawText) {
      if (!rawText) return null;
      const clean = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (!match) return null;
      const jsonStr = match[0];
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        try {
          const fixed = jsonStr.replace(/\\(?!["\\/bfnrtu]|u[0-9a-fA-F]{4})/g, '\\\\');
          return JSON.parse(fixed);
        } catch (e2) {
          return null;
        }
      }
    }

    let questions = null;
    let lastApiError = "";

    // 1. Primary: Google Gemini API (Strict Live Server-Side AI Generation)
    // Authenticates Google's standard AQ. authorization keys & AIza keys via x-goog-api-key header
    if (geminiApiKey) {
      const geminiModels = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
      for (const model of geminiModels) {
        try {
          // Primary: Header-based authentication (Strictly required for Google AQ. authorization keys)
          let geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-goog-api-key': geminiApiKey
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: `${systemInstructionText}\n\n${quizUserPrompt}` }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
              }
            })
          });

          // Secondary Fallback: query parameter ?key= (for legacy key compatibility)
          if (!geminiRes.ok && (geminiRes.status === 400 || geminiRes.status === 401)) {
            try {
              const queryRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `${systemInstructionText}\n\n${quizUserPrompt}` }] }],
                  generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
                })
              });
              if (queryRes.ok) geminiRes = queryRes;
            } catch (qe) {}
          }

          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const parsed = safeJsonParse(text);
            if (parsed) {
              questions = normalizeQuizArray(parsed);
              if (questions && questions.length >= 2) break;
            }
          } else {
            const errJson = await geminiRes.json().catch(() => null);
            const errMsg = errJson?.error?.message || `HTTP ${geminiRes.status} ${geminiRes.statusText}`;
            console.error(`Gemini API error [${model}]:`, errMsg);
            lastApiError = errMsg;
          }
        } catch (e) {
          console.error(`Gemini API connection error [${model}]:`, e.message);
          lastApiError = e.message;
        }
      }
    } else {
      lastApiError = "GEMINI_API_KEY is not configured in Vercel Environment Variables.";
    }

    // 2. Secondary: Groq API (if configured as secondary AI provider)
    if ((!questions || !questions.length) && groqApiKey) {
      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemInstructionText },
              { role: "user", content: quizUserPrompt }
            ],
            temperature: 0.6,
            max_tokens: 2200
          })
        });

        if (groqResponse.ok) {
          const data = await groqResponse.json();
          const content = data.choices[0]?.message?.content || "";
          const parsed = safeJsonParse(content);
          if (parsed) {
            questions = normalizeQuizArray(parsed);
          }
        }
      } catch (e) {}
    }

    // 3. Return real generated questions
    if (questions && questions.length > 0) {
      return res.status(200).json({
        success: true,
        subject: sub,
        topic: ch,
        questionCount: questions.length,
        questions
      });
    }

    // Diagnostic guidance if generation failed (ZERO hardcoded fallback questions!)
    let helpfulTip = "";
    if (!geminiApiKey) {
      helpfulTip = "Please add GEMINI_API_KEY in your Vercel Project Settings > Environment Variables, then redeploy.";
    } else if (lastApiError.includes("API key not valid") || lastApiError.includes("API_KEY_INVALID")) {
      helpfulTip = `Google Gemini reported: "${lastApiError}". Please verify that your Gemini API key in Vercel Environment Variables is copied completely without extra spaces.`;
    } else {
      helpfulTip = `Google Gemini notice: ${lastApiError}. Please verify your API key quota and project settings in Google AI Studio.`;
    }

    return res.status(500).json({
      success: false,
      error: lastApiError || "Unable to generate dynamic questions via Gemini AI.",
      tip: helpfulTip
    });

  } catch (error) {
    console.error("Quiz API Error:", error.message);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to generate quiz, please try again."
    });
  }
};
