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

### Rules Antigravity Strictly Enforces:
- **No Database & No localStorage for streak history:** GitHub `streak.json` is the sole historical source of truth.
- **Duplicate Prevention:** If today is already recorded as `completed: true` in `streak.json`, no redundant commits are made.
- **Conflict Handling (409):** If a SHA conflict occurs, the API refetches the newest file SHA and retries.
- **Base64 Encoding:** Payloads are formatted and base64 encoded according to GitHub REST specification.
- **Dynamic Stats:** Current streak, longest streak, completed days, and calendar coloring are calculated dynamically from the raw history.
