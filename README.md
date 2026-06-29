# Overdrive AI — Autonomous Crisis-Management Cockpit

> **Track**: Last-Minute Life Saver / Proactive Productivity  
> **Built by**: Vayunotics  
> **Stack**: React 18 · Vite · Node.js · Express · WebSockets · Tailwind CSS · Gemini 1.5 Flash

---

## 🧠 What is Overdrive AI?

**Overdrive AI** is a premium, real-time autonomous workspace triage cockpit that replaces passive reminder apps with an **AI agent that takes direct action** when you face an imminent deadline.

Most productivity tools tell you *that* a problem exists. Overdrive AI **fixes it for you**:

| Traditional Tool | What Overdrive AI Does Instead |
|---|---|
| Calendar reminder fires | Agent **auto-reschedules** conflicting blocks and clears focus time |
| Email sits unsent | Agent **auto-drafts** extension requests, apologies, and status updates |
| Drive stores files passively | Agent **surfaces and triages** the right deliverable at the right moment |
| To-do app notifies | Agent **logs every action** and executes autonomously with user approval |

> *"I've drafted your extension email, cleared your next 3 hours, and compiled your slide deck. Awaiting your approval."*

---

## ✨ Features

### 🔐 Authorization & Profile
- Glassmorphic login screen with workspace email and master key validation
- Dark / Light theme toggle available before and after login
- User profile capsule with credentials dropdown (clearance level, linked channels, sign-out)

### 📊 Diagnostics (Default Tab)
- Canvas-based pulsating AI core visualizer — **click it to trigger a live crisis simulation**
- Connected Services grid (Gemini Pro, Mail Agent, Calendar Sync, Slack, Canvas LMS)
- Scrollable Resolution Audit Registry updated in real-time via WebSocket
- AI Thought Stream log feed narrating every autonomous decision

### 📧 Mail Inbox
- Threaded email inbox with sender avatars, timestamps, and unread indicators
- Full email preview panel with Approve / Reject action buttons
- Approved emails update the global triage state and push entries to the audit log
- Live keyword search across email subjects and body content

### 📅 Calendar
- Visual schedule grid with conflict detection and focus block injection
- Click any conflict to open an inline Auto-Reschedule triage modal
- Rescheduling updates the calendar state and logs the action to the audit trail
- Keyword search across event names and descriptions

### 📁 Drive Files
- Folder-based file explorer (Deliverables, Drafts, Logs)
- File content preview panel with Download and Open actions
- **Interactive Upload Simulator**: Click or drag files to trigger an animated multi-stage security scan, after which a new file is dynamically added to the directory
- Live keyword search across file names and content

### 💬 AI Copilot Chat
- Slide-out chat drawer powered by **Gemini 1.5 Flash** (requires API key)
- Falls back to smart local keyword-based responses when offline
- Accepts natural language commands and responds in real-time

### 🔍 Smart Search Bar
- Visible only in Mail and Drive tabs (contextual, not global)
- Voice dictation via Web Speech API (microphone button)

---

## 🗂️ Project Structure

```
OverDrive AI/
│
├── backend/                        # Node.js + Express Backend
│   ├── server.js                   # WebSocket server, REST API, Gemini proxy
│   ├── package.json
│   └── .env.example                # Backend environment variable template
│
├── src/                            # React Frontend
│   ├── App.jsx                     # Root: layout, state, login, routing, copilot
│   ├── main.jsx                    # Vite entry point
│   ├── index.css                   # Global styles and custom tokens
│   └── components/
│       ├── AgentCore.jsx           # Diagnostics: canvas orb, network grid, audit log
│       ├── TriageStream.jsx        # Mail Inbox: threads, approvals, search
│       ├── HijackedTimeline.jsx    # Calendar: schedule blocks, rescheduling
│       └── DriveExplorer.jsx       # Drive: file explorer, upload simulator
│
├── .env.example                    # Root-level credential reference template
├── .gitignore
├── package.json                    # Frontend dependencies
├── tailwind.config.js              # Custom color palette tokens
├── vite.config.js
└── index.html
```

---

## ⚙️ Quick Start

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### 1. Install Dependencies

```bash
# Frontend (run from project root)
npm install

# Backend
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```bash
cd backend
copy .env.example .env
```

Open `backend/.env` and add your credentials:

```env
PORT=5000

# Required for live AI Copilot responses
# Get your key from: https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Google Workspace OAuth (for live Gmail, Calendar, Drive)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/oauth2callback
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Optional: Slack notifications
SLACK_WEBHOOK_URL=your_slack_incoming_webhook_url_here

# Optional: Canvas LMS integration
CANVAS_LMS_TOKEN=your_canvas_lms_token_here
CANVAS_LMS_URL=https://canvas.university.edu
```

> **Note**: The app runs fully in Hybrid/Offline mode without any API keys. All tabs are interactive with rich simulated data.

### 3. Start the Backend

```bash
# From the backend/ directory
npm start
# → Running at http://localhost:5000
```

### 4. Start the Frontend

```bash
# From the project root (new terminal window)
npm run dev
# → Running at http://localhost:3000
```

### 5. Open the App

Navigate to `http://localhost:3000` in your browser. Sign in using the login screen and start exploring!

---

## 🔌 Backend API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check — returns server status |
| `POST` | `/api/copilot` | Sends a message to Gemini 1.5 Flash and returns AI response |
| `POST` | `/api/simulate` | Programmatically triggers a crisis simulation |
| `WS` | `ws://localhost:5000` | Real-time state sync (state, logs, thoughtLog, activeCards) |

---

## 🌐 Deployment

The app has two parts that deploy to different platforms:

| Layer | Recommended Platform | Notes |
|---|---|---|
| **Frontend** (React/Vite) | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Free, CDN-optimized, instant GitHub deploys |
| **Backend** (Node.js + WebSockets) | [Render](https://render.com) or [Railway](https://railway.app) | Free tier, persistent Node.js, full WebSocket support |

> Netlify Functions cannot host persistent WebSocket connections. Always deploy the backend to a platform that supports persistent processes (Render, Railway, or Google Cloud Run).

---

## 🔑 Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key** → **Create API Key in new project**
3. Copy the key (starts with `AIzaSy...` or the newer `AQ.Ab...` format)
4. Paste it into `backend/.env` as `GEMINI_API_KEY=your_key_here`
5. Restart the backend server

---

## 🗺️ Roadmap

- [ ] Real Gmail send via Gmail API (OAuth scoped)
- [ ] Live Google Drive file storage integration
- [ ] Canvas LMS assignment tracker with live due date pulls
- [ ] Multi-user workspace with role-based access control
- [ ] Mobile-first responsive layout overhaul
- [ ] Push notifications via Service Workers
- [ ] Slack live notification delivery

---

## 📄 License

Built by **Vayunotics** for the Last-Minute Life Saver / Proactive Productivity hackathon track.
