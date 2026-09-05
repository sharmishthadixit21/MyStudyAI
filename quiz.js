/**
 * AuraSpace Serverless API Proxy for AI Quiz Generation & Doubt Solver
 * Supports Google Gemini API & fallback model.
 */

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { action, subject, chapter, difficulty, targetExam, userDoubt, chatHistory } = req.body || {};
    const geminiApiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JInv1K4BmdNj90pmdRTWxxiqjzaHiyY3sOlTLilAOmlA";
    const groqApiKey = process.env.GROQ_API_KEY || "";

    // 1. Doubt Solving AI Chat Mode
    if (action === 'chat_doubt') {
      if (!userDoubt) {
        return res.status(400).json({ error: 'userDoubt is required' });
      }

      const systemPrompt = "You are a supportive, genius AI study mentor on AuraSpace. Explain concepts clearly in friendly language with step-by-step logic, easy analogies, and key formulas.";
      const userPrompt = `Target Exam: ${targetExam || 'General'}, Topic: ${subject || 'Study'}, Context: ${chapter || 'General Concept'}. Question: ${userDoubt}`;

      try {
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }]
          })
        });
        if (geminiRes.ok) {
          const gData = await geminiRes.json();
          const reply = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return res.status(200).json({ success: true, reply });
        }
      } catch (e) {}

      // Fallback Groq
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

      if (!groqRes.ok) throw new Error(`API responded with ${groqRes.status}`);
      const data = await groqRes.json();
      const reply = data.choices[0]?.message?.content || "Could not generate explanation.";
      return res.status(200).json({ success: true, reply });
    }

    // 2. Quiz Generator Mode (Strict 4-Options MCQ format with JSON output)
    if (!subject || !chapter) {
      return res.status(400).json({ error: 'Subject and Chapter are required' });
    }

    const nonce = Math.random().toString(36).substring(2, 8) + '-' + Date.now();
    const systemInstructionText = `You are an elite academic examination question designer and exam setter. You MUST ALWAYS return ONLY a valid raw JSON array containing exactly 5 Multiple Choice Questions (MCQs).
CRITICAL RULES:
1. Every question object in the array MUST strictly have this structure:
   {
     "question": "Clear and challenging question statement",
     "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
     "correct_answer": 0,
     "explanation": "Concise 1-2 sentence explanation of why this answer is correct and the fundamental concept/formula."
   }
2. "options" MUST be an array of EXACTLY 4 distinct, plausible options.
3. "correct_answer" MUST be an integer representing the 0-based index of the correct option in the "options" array (0 for A, 1 for B, 2 for C, 3 for D).
4. NEVER return conversational text, greetings, concluding notes, essays, or markdown codeblocks outside the raw JSON array. Return ONLY valid JSON.`;

    const quizUserPrompt = `Generate exactly 5 brand-new, completely UNIQUE, high-yield Multiple Choice Questions (MCQs) strictly tailored to:
- Target Exam: "${targetExam || 'Competitive Exam'}" (reflect the exact pattern, standards, and rigorous style of ${targetExam || 'Competitive Exam'})
- Subject: "${subject}"
- Topic/Chapter: "${chapter}"
- Difficulty Level: "${difficulty || 'standard'}"
- Session Seed: "${nonce}" (ensure unique, fresh questions each time, no repetitive clichés)

All 5 questions must be strictly relevant to Subject "${subject}" and Chapter "${chapter}". Provide exactly 4 options per question.`;

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

        const explanation = item.explanation || item.explain || item.reason || "Correct conceptual reasoning based on standard curriculum.";

        clean.push({
          question: String(qText).trim(),
          q: String(qText).trim(),
          options: opts.map(o => String(o).trim()),
          correct_answer: correctIdx,
          correct: correctIdx,
          explanation: String(explanation).trim()
        });
      }
      return clean.length > 0 ? clean : null;
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

    // 1. Primary: Gemini 3.5 Flash Lite
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstructionText }] },
          contents: [{ parts: [{ text: quizUserPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      });

      if (geminiRes.ok) {
        const gData = await geminiRes.json();
        const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const parsed = safeJsonParse(text);
        if (parsed) {
          questions = normalizeQuizArray(parsed);
        }
      }
    } catch (e) {}

    // 2. Secondary: Gemini 3.1 Flash Lite Backup
    if (!questions || !questions.length) {
      try {
        const geminiBackupRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstructionText }] },
            contents: [{ parts: [{ text: quizUserPrompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.7
            }
          })
        });

        if (geminiBackupRes.ok) {
          const gData = await geminiBackupRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const parsed = safeJsonParse(text);
          if (parsed) {
            questions = normalizeQuizArray(parsed);
          }
        }
      } catch (e) {}
    }

    // 3. Fallback to Groq API if both Gemini endpoints were unavailable
    if (!questions || !questions.length) {
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
            temperature: 0.5,
            max_tokens: 1500
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

    if (!questions || !questions.length) {
      throw new Error("Could not generate questions from Gemini AI. Please try again.");
    }

    return res.status(200).json({ success: true, questions });
  } catch (error) {
    console.error("Quiz API Error:", error.message);
    return res.status(500).json({
      error: error.message,
      fallback: true
    });
  }
};
