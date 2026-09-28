# 🟩 Git Daily Streak — Automated GitHub Streak Engine

A professional developer daily protocol and consistency tracker built with **React** and the **GitHub Repository Contents REST API**.

When you complete your core daily habits, the app automatically commits your progress to your GitHub repository by updating `streak.json` — keeping your daily GitHub commit streak green with zero manual `git commit` or `git push` needed.

---

## ⚡ The Architecture

```
                 BROWSER / REACT
                        │
                        ▼
                 All 5 Core Done?
                   /          \
                 NO            YES
                 │              │
                 ▼              ▼
             Nothing       Check today's date
                                │
                                ▼
                       Already completed?
                          /          \
                        YES           NO
                        │              │
                        ▼              ▼
                     Stop       Secure Server API
                                       │
                                 (GITHUB_TOKEN)
                                       │
                                       ▼
                             GitHub Contents API
                                       │
                              (Read current SHA)
                                       │
                                       ▼
                              PUT /streak.json
                                       │
                                       ▼
                              GitHub automatically
                                 creates commit
                                       │
                                       ▼
                              streak.json updated
                                       │
                                       ▼
                              Calculates streaks
```

### 🔒 Security Guarantee
- **Zero Token Leakage:** The GitHub Personal Access Token is **never** bundled into the React client code or exposed in the browser.
- **Server Middleware / Proxy:** All GitHub API authentication and writes occur through the backend proxy middleware (configured in `vite.config.js` for development and `server.js` for production).
- **Git Ignore:** `.env` and `.env.*` are ignored by `.gitignore`.

---

## 📋 The 7 Constant Daily Tasks

You do not need to type or recreate daily tasks every morning. These 7 constant protocols are built-in:

### Core Requirements (5 Tasks — Triggers GitHub Commit):
1. 💻 **LC Streak** — LeetCode Daily Challenge & Problem Solving
2. 🧘 **Physical and Mental Exercise** — Workout, Cardio, Meditation & Mindfulness
3. 👨‍👩‍👧 **Spending Time with Family and Health Care** — Family time, hydration & wellness
4. 📚 **Study Session-1** — Deep focus primary engineering study block
5. 🔄 **Study / Revision or ARV Session** — Active Recall, Spaced Repetition & Concepts Review

### Bonus Accelerators (2 Tasks — Optional):
6. 🗣️ **Communication [optional]** — English fluency, public speaking, peer discussions
7. 📖 **Study Session-2 [optional]** — Secondary study or project building block

> **Rule:** Once all **5 Core Tasks** are ticked, the system commits today's streak to GitHub! Optional tasks enhance your personal tracking but do not block the commit.

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
cd daily-streak
npm install
```

### 2. Configure GitHub Token (.env)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Open `.env` and fill in your details:
```env
GITHUB_TOKEN=github_pat_11A...YOUR_TOKEN...
GITHUB_OWNER=your_github_username
GITHUB_REPO=daily-streak
GITHUB_BRANCH=main
```

#### How to create your fine-grained GitHub token in 1 minute:
1. In GitHub, go to **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**.
2. Click **Generate new token**.
3. **Token name:** `Daily-Streak-Automator`
4. **Repository access:** *Only select repositories* → choose your `daily-streak` repository.
5. **Permissions:**
   - Under **Repository permissions**, find **Contents** and set it to **Read and write**.
6. Generate token and paste it into `.env`.

### 3. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`. You will see the live status indicator `🟢 username/daily-streak (main)`.

---

## 📁 Persistent Storage (`streak.json`)

Your persistent storage is `streak.json` in your repository root:

```json
{
  "2026-09-27": {
    "completed": true
  },
  "2026-09-28": {
    "completed": true
  }
}
```

### Rules Strictly Enforces:
- **No Database & No localStorage for streak history:** GitHub `streak.json` is the sole historical source of truth.
- **Duplicate Prevention:** If today is already recorded as `completed: true` in `streak.json`, no redundant commits are made.
- **Conflict Handling (409):** If a SHA conflict occurs, the API refetches the newest file SHA and retries.
- **Base64 Encoding:** Payloads are formatted and base64 encoded according to GitHub REST specification.
- **Dynamic Stats:** Current streak, longest streak, completed days, and calendar coloring are calculated dynamically from the raw history.
### For more clarity
Part 1: Token vs. SHA — What is the difference?
Think of them as two completely different tools:

Item	What is it?	Real-World Analogy
GitHub Token (PAT)	Your Digital ID / Security Keycard	Proves WHO you are and that you have permission to write to Daily-Streak.
SHA (e.g. f4ac087...)	The Fingerprint of the file	Proves WHICH VERSION of streak.json you are currently updating.
How does the website get the token?
You added GITHUB_TOKEN into Vercel’s Environment Variables.
Your browser never sees this token! (If it did, anyone could open DevTools and steal it).
Instead, the token lives safely on Vercel’s secure server in the cloud (process.env.GITHUB_TOKEN).
When your browser calls /api/streak/complete, Vercel’s backend attaches the token behind the scenes when talking to GitHub.
Why does GitHub need the SHA?
In Git, every file version has a unique 40-character fingerprint called a SHA. Before GitHub allows you to update a file through the API, it asks:

"What is the SHA of the file you are trying to change?"

If GitHub's current file SHA is f4ac087... and you send f4ac087..., GitHub says:

"Great, you are modifying the latest version!"

If someone else had edited the file in the meantime, the SHA would be different, and GitHub would stop you to prevent overwriting someone else's work (this is known as a 409 Conflict).

Part 2: The Inner Process — How completing 5 tasks triggers a commit automatically
Here is the exact step-by-step chain reaction that happens in less than 1 second:



[ You tick 5th task ]
         │
         ▼
 1. React Browser State
    - Calculates: all 5 core tasks are checked.
    - Sends an HTTP request to Vercel:
      POST /api/streak/complete
      { "date": "2026-09-28" }
         │
         ▼
 2. Vercel Serverless Backend (Cloud)
    - Receives the request.
    - Reads your secret GITHUB_TOKEN from its environment variables.
         │
         ▼
 3. Backend talks to GitHub REST API
    - STEP A: Calls GitHub:
      GET https://api.github.com/repos/gmanikrishna-mA7/Daily-Streak/contents/streak.json
    - GitHub replies with:
      • Current content: { "2026-09-27": { "completed": true } }
      • Current file SHA: "f4ac087dc9160bf3f8e7f692b61fab61387d3b3e"
         │
         ▼
 4. Backend prepares the update
    - Checks: Is "2026-09-28" already completed? (If yes, stops to prevent duplicate commits).
    - If NO, adds today:
      {
        "2026-09-27": { "completed": true },
        "2026-09-28": { "completed": true }
      }
    - Encodes this text into Base64 format (required by GitHub API).
         │
         ▼
 5. The Magic: PUT request to GitHub Contents API
    - Vercel sends a request directly to GitHub:
      PUT https://api.github.com/repos/gmanikrishna-mA7/Daily-Streak/contents/streak.json
      Headers: Authorization: Bearer <Your GITHUB_TOKEN>
      Body: {
        "message": "Daily Streak - 2026-09-28",
        "content": "<BASE64_JSON>",
        "sha": "f4ac087dc9160bf3f8e7f692b61fab61387d3b3e"
      }
         │
         ▼
 6. What GitHub does on its servers:
    Normally in your terminal, you would run 3 manual commands:
    1. git add streak.json
    2. git commit -m "Daily Streak - 2026-09-28"
    3. git push origin main
    
    GitHub's Contents API performs all 3 of those Git operations internally on GitHub's servers in a single millisecond!
    It updates streak.json, creates the Git commit, updates the main branch, and lights up your green contribution square on your GitHub profile.
         │
         ▼
 7. Response back to your Website
    - GitHub replies: "201 Created (Commit SHA: 12ab34cd...)"
    - React receives the confirmation.
    - Confetti fires on your screen! 🎉
    - Your streak jumps from 1 Day ➔ 2 Days!
Summary
React in browser tracks your checkboxes locally.
When the 5th core task is ticked, React asks Vercel.
Vercel holds your GitHub Token, asks GitHub for the file's current SHA, merges today's date, and calls GitHub's Contents API.
GitHub creates the commit on your repository automatically.
Your GitHub Profile detects the new commit and lights up your daily green square!
11:48 PM
ok if i not deployed my webiste then whom will send Post request from react and how that goes to Git Rest apis without vercel backed
This is the exact question that separates a beginner from someone who truly understands client vs. server architecture!

Here is how it works when you are NOT deployed on Vercel:

1. Who acts as the backend when running locally?
When you run:

bash


npm run dev
You are starting a Node.js server running on your own computer (via Vite).

Vite is not just serving your React HTML; Vite has a built-in Node.js server. In your 
vite.config.js
, we wrote a custom plugin called streakApiPlugin:

javascript


// Inside vite.config.js on your laptop:
server.middlewares.use(async (req, res, next) => {
  if (req.method === 'POST' && url.pathname === '/api/streak/complete') {
    // 1. Reads your local .env file
    // 2. Talks directly to GitHub REST API from your laptop!
  }
});
So on your computer:



Your Browser (React) 
       │
       ▼  (POST http://localhost:5173/api/streak/complete)
Vite's Local Node.js Server (on your computer)
       │  (Reads local .env file)
       ▼  (HTTPS PUT to api.github.com)
GitHub REST API
2. Can React talk to GitHub directly without any server at all?
Technically, yes, the browser fetch() can call GitHub's API directly.

BUT HERE IS THE DANGER: If React calls GitHub directly from the browser, you would have to write your GitHub token inside React code:

javascript


// ❌ DANGEROUS: Putting your token in React browser code
const token = "github_pat_11BTVA6EI0dmnNh5homlJ2...";
fetch("https://api.github.com/repos/gmanikrishna-mA7/Daily-Streak/contents/streak.json", {
  headers: {
    Authorization: `Bearer ${token}` // ⚠️ Anyone can inspect and steal this!
  }
});
If you do that:

Anyone who visits your website could right-click ➔ Inspect ➔ Network or Sources tab.
They can see your full github_pat_xxxx token in plain text!
With that token, they could delete files, push unwanted commits, or modify your repository!
3. The Comparison: Local vs. Vercel
Notice how both setups use the exact same architecture to protect your token:

When Running Locally	When Deployed on Vercel
Where does React run?	In your browser (localhost:5173)	In your browser (daily-streak-flame.vercel.app)
Who receives the /api/streak/complete request?	Vite's Node.js server on your laptop	Vercel's Node.js Serverless Function in the cloud
Where is the token stored?	In your local .env file	In Vercel's cloud Environment Variables
Who sends the PUT request to GitHub?	Your laptop's Node.js process	Vercel's cloud Node.js server
Is the token safe from visitors?	✅ Yes, 100% hidden	✅ Yes, 100% hidden
So whether you are running locally via npm run dev or deployed on Vercel, React always talks to a backend Node.js proxy, and the backend is what securely communicates with GitHub!
