# Overdrive AI // Autonomous Crisis Triage Control Center

**Overdrive AI** is an ultra-premium, dark-themed, highly interactive "War Room" dashboard designed for high-stakes, last-minute deadline mitigation. It completely replaces passive productivity checklists with an **Autonomous Crisis-Management Agent** that takes meaningful action (e.g., auto-drafting request extensions, dynamically rescheduling calendar blocks, muting notification channels, and enforcing deep focus lockdown) when a user faces an imminent deadline threat.

Built specifically for a 5-day hackathon under the **Last-Minute Life Saver / Proactive Productivity** track.

---

## 🚀 Key Architecture & Layout Zones

The interface is structured as an asymmetrical three-column dashboard:

### 🌌 Zone A: The Agentic Pulse & Live Command (Centerpiece)
- **Active AI Core**: Driven by an HTML5 Canvas-based wave visualizer that updates its shape, amplitude, frequency, and colors (Cyan, Amber/Crimson, Emerald) based on system status.
- **ResizeObserver Powered**: Guards against responsive canvas stretching or blurriness on high-DPR screens.
- **Typewriter Thought Stream**: Shows the AI's real-time autonomous thinking logs as it evaluates threats and executes scripts.

### 📅 Zone B: The "Hijacked" Dynamic Timeline (Left Column)
- **Interactive Calendar Hijack**: Displays a vertical 12-hour schedule thread.
- **State Transition**: In a pre-crisis state, it shows a standard, passive schedule. When a crisis triggers, it mutes/strikes out conflicting blocks (auto-decline requests, notifications muted) and injects red-glowing **Crisis Zones** and cyan-glowing **AI Triage/Lockdown Windows**.

### 📋 Zone C: The Action Triage Stream (Right Column)
- **Autonomous Queue**: Features action cards that represent actions queued or executed by the agent (e.g. an auto-drafted email, Slack reschedule notifications).
- **Auto-Execute Countdown**: Interactive countdowns automatically commit actions if the user doesn't intervene.
- **Micro-Validation Action Dissolves**: Clicking "Approve" or hitting `Space` triggers a green dissolve/fade transition, appending permanent, precise logs in a scrolling terminal.

---

## 🛠️ The Veteran's Edge: Hackathon Pitch Tweaks

These custom features ensure the project stands out during live presentations:

1. **Master Demo Reset (`Shift + R`)**: Wipes active crisis states, resets timers, and restores the timeline to its passive form without requiring a full browser reload. Ideal for back-to-back judge pitches.
2. **Audio Synthesizer (Web Audio API)**: Generates high-tech alarms, keystrokes, success confirmations, and cancel sweeps directly in the browser via oscillator synthesis. Requires no external audio files.
3. **Static scanlines**: High-performance static CRT scanlines that avoid heavy frame-rate drops on older presentation projectors.
4. **Active Target Ribbon**: A glowing indicator clearly shows the current keyboard target card.

---

## ⌨️ Control Deck (Keyboard Shortcuts)

These shortcuts work globally across the app:

| Shortcut | Action | Description |
| --- | --- | --- |
| `Space` | **Approve & Send** | Commits and dispatches the active target card. |
| `Escape` | **Abort Action** | Cancels and clears the active target card from queue. |
| `Shift + D` | **Focus Bypass** | Toggles focus lock override (Bypassed / Enforced). |
| `Shift + R` | **Master Demo Reset** | Wipes active crisis, resets logs, restores ambient monitoring. |

---

## ⚙️ Quick Start Installation

Run the following commands in the project directory:

```bash
# 1. Install dependencies
npm install

# 2. Run local Vite development server
npm run dev
```

The application will launch locally at `http://localhost:3000`.
