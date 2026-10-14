# SolveHub ⚡

**SolveHub** is a Reddit-style social platform where users post real-world problems and submit solutions (as text, code snippets, uploaded projects, or live websites) with an integrated AI assistant powered by **`gemini-2.0-flash`**.

---

## 🌟 New Feature: Rich Solution Types & Live Sandboxed Previews

Users can reply to any problem using one of four solution formats:

### 1. 📝 Text Answer
Traditional text response for theoretical discussions and advice.

### 2. 💻 Code Snippet
- Full code editor box with line numbers, monospace styling, and dark theme.
- Language selector: **Python, JavaScript, HTML/CSS, Java, C++, SQL, Other**.
- One-click **Copy Code** button.
- **Run / Live Preview** button for HTML/CSS and JavaScript snippets.
- Short explanation field.
- **Review with SolveBot**: Analyzes the snippet for bugs, edge cases, and performance optimizations.

### 3. 📦 Upload Project
- Drag-and-drop file uploader supporting `.zip` files and source files (`.html`, `.css`, `.js`, `.py`, `.ipynb`, `.txt`, `.md`, images).
- Enforces **10 MB maximum** file size with client & server-side validation.
- Shows file name, formatted size, and a **Download** button.
- **Static Website Live Preview**: If a `.zip` archive or HTML file containing `index.html` is uploaded, users can click **"Run / Live Preview"** to test it immediately.

### 4. 🌐 Website Link
- Input deployed site URL (Vercel, Netlify, GitHub Pages, Firebase Hosting) and optional GitHub repository link.
- Displays a preview card with favicon, clean links, and a **Live Preview** button.
- External sites are safely previewed in a sandboxed iframe with an "Open in new tab" fallback.

---

## 🖥️ Live Sandboxed Preview Modal

- Sandboxed iframe with `sandbox="allow-scripts"` (zero access to parent page cookies, storage, or parent DOM).
- Responsive view toggles:
  - **Desktop View**: Wide-screen desktop layout.
  - **Mobile View**: Realistic 375px mobile device viewport.
- Refresh / re-run button to reload the sandbox on demand.

---

## 🤖 AI Integrations (`gemini-2.0-flash`)

1. **"Review with SolveBot" on Solutions**:
   - Senior architect code review covering functionality, bugs, edge cases, and security under 200 words.
   - Endpoint: `POST /api/ai/review`
2. **"Fix code with AI" on Problem Posts**:
   - Detects code in problem descriptions and provides a corrected version with explanations.
   - Endpoint: `POST /api/ai/fix-code`
3. **"Ask AI" Step-by-Step Solutions**:
   - Appends a structured step-by-step resolution to any problem.
   - Endpoint: `POST /api/ai/solve`
4. **Solve AI Chat Widget**:
   - Floating assistant for conversational debugging and brainstorming.
   - Endpoint: `POST /api/ai/chat`

---

## 🏆 User Profile & Solutions Portfolio

- Every user profile includes a dedicated **"Solutions Portfolio"** tab.
- Displays all code snippets, uploaded projects, deployed websites, and text solutions contributed by that user.
- Highlights **Helpful Solutions (🏆)** awarded by problem authors.

---

## 🛡️ Safety & Storage Rules

- **Client & Server Validation**: Max 10 MB file limit and extension whitelist (`.zip, .html, .css, .js, .py, .ipynb, .txt, .md, images`).
- **Filename Sanitization**: Replaces dangerous characters with safe identifiers.
- **Sandboxed Execution**: Code is NEVER executed on the backend server.
- **Report Button**: Present on every solution for flagging spam or broken code.
- **Storage Rules ([storage.rules](file:///d:/problems%20and%20solutions/storage.rules))**:
  - Only authenticated owners can upload files up to 10 MB.
  - Only owners can delete their files.
  - All authenticated users can read/download solutions.
- **Firestore Security Rules ([firestore.rules](file:///d:/problems%20and%20solutions/firestore.rules))**:
  - Enforces ownership on updates and deletions for posts and solution comments.

---

## 🚀 Running the Application

### 1. Start the Gemini 2.0 Flash Backend

```powershell
cd "d:\problems and solutions\server"
npm install
npm run dev
```

Server runs on `http://localhost:3001`.

### 2. Start the Frontend Client

```powershell
cd "d:\problems and solutions"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.
