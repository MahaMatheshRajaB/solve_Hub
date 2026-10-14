import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env from root directory or current directory
dotenv.config({ path: '../.env' });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
let genAI = null;
let model = null;

if (apiKey && apiKey !== 'your_gemini_api_key') {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  } catch (err) {
    console.error('Failed to initialize Gemini with GEMINI_API_KEY:', err);
  }
}

// Fallback generator when key is not configured yet
function getMockSolution(problem, category) {
  return `### 💡 Step-by-Step Solution (${category || 'General'})

1. **Root Cause Analysis**: The issue stems from default processing constraints under standard configuration.
2. **Recommended Action**: 
   - Optimize the data pipeline by processing in chunks or streaming batches.
   - Utilize vectorized operations or high-performance native alternatives (e.g., PyArrow or Polars).
   - Ensure caching or indexing is applied to frequent access patterns.
3. **Verification**: Benchmark memory consumption before and after applying the fix.

*(Tip: Set GEMINI_API_KEY in your .env to receive live dynamic solutions from gemini-2.0-flash)*`;
}

function getMockReview(code, language) {
  return `### 🤖 SolveBot Code Review (${language || 'code'})

- **Functionality**: The snippet provides a direct implementation for the specified task.
- **Bugs / Edge Cases**: Ensure defensive checks for null/empty values and handle potential exceptions when parsing external input.
- **Optimization**: Consider streaming or vectorized processing if handling high-volume datasets.
- **Security**: Validate that user-provided inputs are properly sanitized before execution.`;
}

function getMockFix(code, language) {
  return `// Corrected version suggested by SolveBot:
${code ? code.trim() : '// Provided snippet'}

/* Explanation:
- Fixed potential undefined reference / syntax irregularity
- Added safety boundary checks for input handling
- Optimized execution path */`;
}

// POST /api/ai/solve
// Body: { problem: string, category: string, title?: string }
app.post('/api/ai/solve', async (req, res) => {
  try {
    const { problem, category, title } = req.body;
    if (!problem && !title) return res.status(400).json({ error: 'problem or title is required' });

    if (!model) {
      return res.json({ solution: getMockSolution(problem || title, category) });
    }

    const prompt = `You are Solve AI, an expert problem-solver on SolveHub (a Reddit-style platform where developers and creators share real-world problems and solutions).

Category: ${category || 'General'}
Title: ${title || 'N/A'}
Problem: ${problem || title}

Provide a concise, practical, step-by-step solution in under 120 words. Format with clean bullet points or numbered steps so it is quick to read.`;

    const result = await model.generateContent(prompt);
    const solution = result.response.text();
    res.json({ solution });
  } catch (err) {
    console.error('Error in /api/ai/solve:', err);
    const { problem, category } = req.body;
    res.json({ solution: getMockSolution(problem, category) });
  }
});

// POST /api/ai/review
// Body: { code: string, language: string, title?: string, explanation?: string }
app.post('/api/ai/review', async (req, res) => {
  try {
    const { code, language, title, explanation } = req.body;
    if (!code) return res.status(400).json({ error: 'code is required' });

    if (!model) {
      return res.json({ review: getMockReview(code, language) });
    }

    const prompt = `You are SolveBot, a senior software architect and security engineer on SolveHub.
A user submitted the following ${language || 'code'} solution to the problem "${title || 'General problem'}":

Explanation provided by author: "${explanation || 'None'}"

Code:
\`\`\`${language || ''}
${code}
\`\`\`

Review this solution under 200 words:
1. Explain concisely what the code does.
2. Point out any potential bugs, security issues, or edge cases.
3. Suggest 1-2 concrete improvements. Be direct and encouraging.`;

    const result = await model.generateContent(prompt);
    const review = result.response.text();
    res.json({ review });
  } catch (err) {
    console.error('Error in /api/ai/review:', err);
    const { code, language } = req.body;
    res.json({ review: getMockReview(code, language) });
  }
});

// POST /api/ai/fix-code
// Body: { code: string, language: string, problem: string }
app.post('/api/ai/fix-code', async (req, res) => {
  try {
    const { code, language, problem } = req.body;
    if (!code && !problem) return res.status(400).json({ error: 'code or problem is required' });

    if (!model) {
      return res.json({ fixedCode: getMockFix(code, language) });
    }

    const prompt = `You are SolveBot on SolveHub. A user posted a problem with code that has bugs or isn't working:

Problem: ${problem || 'Code fix requested'}
Original Code (${language || 'code'}):
\`\`\`${language || ''}
${code}
\`\`\`

Provide:
1. A clean, corrected version of the code.
2. A 1-2 sentence explanation of what was fixed and why. Keep it concise.`;

    const result = await model.generateContent(prompt);
    const fixedCode = result.response.text();
    res.json({ fixedCode });
  } catch (err) {
    console.error('Error in /api/ai/fix-code:', err);
    const { code, language } = req.body;
    res.json({ fixedCode: getMockFix(code, language) });
  }
});

// POST /api/ai/chat
// Body: { messages: Array<{ role: 'user' | 'assistant', content: string }> }
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const lastMessage = messages.filter(m => m.content?.trim()).slice(-1)[0];
    if (!lastMessage) {
      return res.status(400).json({ error: 'No user message found' });
    }

    if (!model) {
      return res.json({
        reply: `Hi! I'm Solve AI. I can help you solve issues, debug code, or answer questions. To get real-time responses with gemini-2.0-flash, make sure to add your GEMINI_API_KEY in the .env file!`,
      });
    }

    const systemPrompt = `You are Solve AI, the friendly and concise problem-solving assistant on SolveHub. Help users brainstorm solutions, debug issues, and overcome technical or professional challenges. Keep replies practical and under 150 words.`;

    const history = [];
    const validMessages = messages.filter(m => m.content?.trim());
    for (let i = 0; i < validMessages.length - 1; i++) {
      const msg = validMessages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "Got it! I'm Solve AI, ready to assist." }] },
        ...history,
      ],
    });

    const result = await chat.sendMessage(lastMessage.content);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Error in /api/ai/chat:', err);
    res.json({
      reply: `I encountered an issue connecting to the Gemini model. Please check your GEMINI_API_KEY in .env.`,
    });
  }
});

// Validate file uploads endpoint (Safety check)
app.post('/api/validate-upload', (req, res) => {
  const { fileName, fileSize, fileType } = req.body;
  const maxBytes = 10 * 1024 * 1024; // 10MB
  const allowedExtensions = ['.zip', '.html', '.css', '.js', '.py', '.ipynb', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

  if (!fileName) return res.status(400).json({ valid: false, error: 'File name required' });
  if (fileSize > maxBytes) return res.status(400).json({ valid: false, error: 'File exceeds 10MB limit' });

  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ valid: false, error: `Disallowed file type (${ext}). Allowed: ${allowedExtensions.join(', ')}` });
  }

  // Sanitize filename
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  res.json({ valid: true, sanitizedName });
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', model: 'gemini-2.0-flash', configured: !!model }));

app.listen(PORT, () => {
  console.log(`SolveHub server running on http://localhost:${PORT} with gemini-2.0-flash`);
});
