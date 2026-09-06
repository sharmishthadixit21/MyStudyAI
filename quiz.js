/**
 * AuraSpace Serverless API Proxy for AI Quiz Generation & Doubt Solver
 * Uses Google Gemini AI (gemini-2.5-flash, 2.5-flash-lite, 2.0-flash, 1.5-flash)
 * Generates dynamic, custom MCQs hand-to-hand on the spot from user topic and subject.
 */


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
   const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY || "";

    // 1. Doubt Solving AI Chat Mode (Live Gemini Response)
    if (action === 'chat_doubt') {
      if (!userDoubt) {
        return res.status(400).json({ error: 'userDoubt is required' });
      }

      const systemPrompt = "You are a supportive, genius AI study mentor on AuraSpace. Explain concepts clearly in friendly language with step-by-step logic, easy analogies, and key formulas. Be concise (2-4 sentences).";
      const userPrompt = `Target Exam: ${targetExam || 'General'}, Subject: ${subject || 'Study Topic'}, Context/Chapter: ${chapter || 'Core Concept'}.\nStudent Doubt/Question: ${userDoubt}`;

      if (geminiApiKey) {
        const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
        for (const model of geminiModels) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
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

      // Fallback Groq if available
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
        reply: `Here is a clear breakdown for ${subject || 'your topic'} (${chapter || 'Core Concept'}):\n1. Identify the fundamental principle/formula.\n2. Break the question into given values and target unknowns.\n3. Watch for boundary conditions and standard unit conversions (SI units).\n4. Review the step-by-step derivation to master this concept thoroughly!`
      });
    }

    // 2. Real-Time AI Quiz Generator Mode (Live Gemini 5-MCQs JSON)
    const sub = String(subject || 'General Studies').trim();
    const ch = String(chapter || 'Key Concepts').trim();
    const diff = String(difficulty || 'standard').trim();
    const exam = String(targetExam || 'Competitive Exam').trim();
    const nonce = Math.random().toString(36).substring(2, 8) + '-' + Date.now();

    const systemInstructionText = `You are an elite academic examination question designer and exam setter.
You MUST ALWAYS generate and return ONLY a valid raw JSON array containing exactly 5 Multiple Choice Questions (MCQs).

CRITICAL FORMAT RULES:
1. Every object in the array MUST strictly follow this exact JSON schema:
   {
     "question": "Clear, precise and academically challenging question statement",
     "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
     "correct_answer": 0,
     "explanation": "Concise 1-2 sentence explanation of why this option is correct, citing the formula/theorem/fact."
   }
2. "options" MUST be an array of EXACTLY 4 distinct, plausible options.
3. "correct_answer" MUST be an integer representing the 0-based index of the correct answer in the "options" array (0 for A, 1 for B, 2 for C, 3 for D).
4. Return ONLY the raw JSON array. Never include markdown backticks (like \`\`\`json), conversation, greetings, or extra text.`;

    const quizUserPrompt = `Create exactly 5 brand-new, completely unique, high-yield Multiple Choice Questions (MCQs) right now for:
- Target Exam: "${exam}" (strictly reflect the standard, depth, and rigorous examination style of ${exam})
- Subject: "${sub}"
- Topic/Chapter: "${ch}"
- Difficulty Level: "${diff}"
- Session Seed: "${nonce}" (generate completely fresh questions on the spot, no duplicates)

Ensure every single question is directly and strictly about "${ch}" in "${sub}". Provide exactly 4 options per question and valid 0-based correct_answer.`;

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

        // Ensure 4 options
        const finalOptions = opts.map(o => String(o).trim());
        if (finalOptions.length > 4) finalOptions.length = 4;

        clean.push({
          question: String(qText).trim(),
          q: String(qText).trim(),
          options: finalOptions,
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

    // 1. Primary: Gemini Models Sequence (Live API Call)
    if (geminiApiKey) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
      for (const model of geminiModels) {
        try {
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
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

          if (geminiRes.ok) {
            const gData = await geminiRes.json();
            const text = gData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const parsed = safeJsonParse(text);
            if (parsed) {
              questions = normalizeQuizArray(parsed);
              if (questions && questions.length >= 3) break;
            }
          }
        } catch (e) {}
      }
    }

    // 2. Secondary: Groq Fallback (if configured)
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

    if (questions && questions.length > 0) {
      return res.status(200).json({ success: true, questions });
    }

    return res.status(500).json({
      success: false,
      error: "Failed to generate quiz, please try again."
    });

  } catch (error) {
    console.error("Quiz API Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate quiz, please try again."
    });
  }
};
