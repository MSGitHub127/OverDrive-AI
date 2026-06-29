import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
// Fallback: Check parent directory if API key is not found in the current folder
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.join(process.cwd(), '..', '.env') });
}
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// REST Health Check Endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'active', 
    service: 'Overdrive AI Triage Backend',
    version: '1.1.0'
  });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Global Application State (Single Source of Truth)
let state = 'idle'; // 'idle' | 'critical' | 'thinking' | 'mitigated'
let activeCards = [];
let logs = [];
let thoughtLog = [
  "MONITORING: All calendar accounts and submission channels secure. System running background syncs..."
];

// Helper to broadcast state to all WebSocket clients
function broadcastState() {
  const data = JSON.stringify({
    type: 'SYNC_STATE',
    payload: { state, activeCards, logs, thoughtLog }
  });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(data);
    }
  });
}

// Helper to add logs on the server
function appendLog(type, message) {
  const time = new Date().toLocaleTimeString([], { hour12: false });
  logs.push({
    id: Math.random().toString(),
    time,
    type,
    message
  });
}

// Reset the entire demo state
function resetDemo() {
  state = 'idle';
  activeCards = [];
  thoughtLog = [
    "MONITORING: All calendar accounts and submission channels secure. System running background syncs..."
  ];
  broadcastState();
}

// Initialise a critical deadline incident
function triggerCrisis() {
  state = 'critical';
  thoughtLog = [
    "BREACH DETECTED: CS401 Presentation variance identified. 45 minutes remaining, deliverables missing.",
    "THREAT LEVEL HIGH: Executing proactive conflict resolution protocols."
  ];

  activeCards = [
    {
      id: 'card-1',
      type: 'email',
      title: 'EXTENSION REQUEST: CS401',
      countdown: 15,
      details: {
        to: 'prof.miller@university.edu',
        subject: 'Extension Request / Deadline Conflict - CS401 Presentation',
        body: 'Dear Professor Miller,\n\nI am writing to formally request a 24-hour extension on the CS401 Presentation submission due to a high-priority deadline conflict. I have rescheduled my other commitments to guarantee completion by tomorrow evening. Thank you for your understanding.\n\nBest regards,\n[Student Name]'
      }
    },
    {
      id: 'card-2',
      type: 'notification',
      title: 'SLACK APOLOGY: TEAM WORKSPACE',
      countdown: 25,
      details: {
        message: 'Team, I am running slightly behind on the slide deck compile. Apology draft transmitted to primary communication channels. Restructuring calendar slots to lock focus now.'
      }
    },
    {
      id: 'card-3',
      type: 'tasks',
      title: 'AUTONOMOUS RESOLUTION PATH',
      details: {
        tasks: [
          { title: 'Ingest Course Outline', status: 'completed' },
          { title: 'Detect Deadline Conflict', status: 'completed' },
          { title: 'Generate Apology & Request Drafts', status: 'completed' },
          { title: 'Re-align Calendar Slots', status: 'active' },
          { title: 'Transmit Extension Requests', status: 'pending' },
          { title: 'Verify Gateway Acknowledgement', status: 'pending' }
        ]
      }
    }
  ];

  broadcastState();
}

// Process a card approval action
function approveCard(cardId) {
  const card = activeCards.find(c => c.id === cardId);
  if (!card) return;

  if (card.type === 'email') {
    appendLog('APPROVED', 'Apology draft transmitted to primary communication channels.');
    thoughtLog.unshift("AUTO-DRAFTING: Generated extension request email. Launching approval countdown.");
  } else if (card.type === 'notification') {
    appendLog('APPROVED', 'Autonomous schedule realignment initiated.');
    thoughtLog.unshift("TRIAGING: Initiating automated slide draft compilation...");
  }

  // Remove card from queue
  activeCards = activeCards.filter(c => c.id !== cardId);

  // Update task list status if present
  const tasksCard = activeCards.find(c => c.type === 'tasks');
  if (tasksCard && tasksCard.details) {
    if (card.type === 'email') {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => 
        t.title.includes('Transmit') ? { ...t, status: 'completed' } : t
      );
    } else if (card.type === 'notification') {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => 
        t.title.includes('Re-align') ? { ...t, status: 'completed' } : t
      );
    }
  }

  // Check if all actionable cards are cleared
  const actionCards = activeCards.filter(c => c.type !== 'tasks');
  if (actionCards.length === 0) {
    state = 'mitigated';
    thoughtLog.unshift("MITIGATED: Crisis triaged successfully. Submission extension pending. Focus lock released.");
    
    // Complete remaining items on the task breakdown
    if (tasksCard && tasksCard.details) {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => ({ ...t, status: 'completed' }));
    }
  } else {
    state = 'thinking';
  }

  broadcastState();
}

// Process a card abort/bypass action
function abortCard(cardId) {
  const card = activeCards.find(c => c.id === cardId);
  if (!card) return;

  appendLog('ABORTED', `User bypassed ${card.title} action. Standby.`);
  thoughtLog.unshift(`BYPASS: Autonomous action ${card.title} aborted by user.`);

  activeCards = activeCards.filter(c => c.id !== cardId);

  const tasksCard = activeCards.find(c => c.type === 'tasks');
  if (tasksCard && tasksCard.details) {
    if (card.type === 'email') {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => 
        t.title.includes('Transmit') ? { ...t, status: 'aborted' } : t
      );
    } else if (card.type === 'notification') {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => 
        t.title.includes('Re-align') ? { ...t, status: 'aborted' } : t
      );
    }
  }

  const actionCards = activeCards.filter(c => c.type !== 'tasks');
  if (actionCards.length === 0) {
    state = 'mitigated';
    thoughtLog.unshift("MITIGATED: Intercept sweep finished. Focus lock released.");
    if (tasksCard && tasksCard.details) {
      tasksCard.details.tasks = tasksCard.details.tasks.map(t => 
        t.status === 'pending' || t.status === 'active' ? { ...t, status: 'completed' } : t
      );
    }
  }

  broadcastState();
}

// WebSockets Message Routing Gateway
wss.on('connection', (ws) => {
  console.log('Client connected to Live socket.');
  
  // Send state on handshake
  ws.send(JSON.stringify({
    type: 'SYNC_STATE',
    payload: { state, activeCards, logs, thoughtLog }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('WS Message Received:', data.type);

      switch (data.type) {
        case 'TRIGGER_CRISIS':
          triggerCrisis();
          break;
        case 'APPROVE_CARD':
          approveCard(data.payload.cardId);
          break;
        case 'ABORT_CARD':
          abortCard(data.payload.cardId);
          break;
        case 'RESET_DEMO':
          resetDemo();
          break;
        default:
          console.log('Unknown socket event:', data.type);
      }
    } catch (e) {
      console.error('Error parsing WS message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from Live socket.');
  });
});

// Backend Active Timer & Auto-triage loop (Ticks every 1 second)
setInterval(() => {
  if (state === 'critical' || state === 'thinking') {
    let stateChanged = false;

    // Find the first actionable card that has a countdown
    const targetCard = activeCards.find(c => c.countdown !== undefined && c.countdown > 0);
    if (targetCard) {
      targetCard.countdown -= 1;
      stateChanged = true;

      // Auto-approve when countdown reaches 0
      if (targetCard.countdown === 0) {
        console.log(`Auto-approving expired card: ${targetCard.id}`);
        approveCard(targetCard.id);
      } else {
        // Broadcast periodic countdown ticks
        broadcastState();
      }
    }
  }
}, 1000);

// Local helper to match keyword patterns (failover fallback)
function getMockReply(message, state) {
  const lower = message.toLowerCase();
  if (lower.includes("status") || lower.includes("state")) {
    return `[Local Agent] System Status is currently "${state.toUpperCase()}". Guard shield is active and monitoring targets.`;
  } else if (lower.includes("conflict") || lower.includes("calendar") || lower.includes("reschedule")) {
    return `[Local Agent] Detected calendar conflict. Navigating to the Calendar tab and clicking "Auto-Reschedule (AI)" inside the slot will resolve the block.`;
  } else if (lower.includes("email") || lower.includes("draft") || lower.includes("triage")) {
    return `[Local Agent] Active email draft pending auto-triage. Apology template is loaded inside the Mail Inbox tab.`;
  } else if (lower.includes("rule") || lower.includes("focus") || lower.includes("lockdown")) {
    return `[Local Agent] Focus rules suppress sound alerts and block distraction categories during active Deep Work alignment zones.`;
  } else if (lower.includes("hello") || lower.includes("hi")) {
    return `[Local Agent] Greetings! How can I assist you with today's tactical course load?`;
  } else {
    return `[Local Agent] Understood. Analyzing course deliverables. Type 'status', 'calendar', or 'draft' for direct operations.`;
  }
}

// REST endpoint to process Copilot chats with Gemini API
app.post('/api/copilot', async (req, res) => {
  const { message, contextState } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.includes('YOUR_GEMINI') || apiKey.trim() === '') {
    return res.json({ reply: getMockReply(message, contextState) });
  }

  try {
    const prompt = `You are the Overdrive Autonomous Triage Agent Copilot.
The current system state is: ${contextState}.
The user says: "${message}".
Provide a concise, helpful response in under 3 sentences. Keep the tone professional, technical, and slightly cybernetic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Check if the Google Gemini API returned an error payload
    if (data.error) {
      console.error("Gemini API Error details:", data.error);
      return res.json({ 
        reply: `Gemini API Error: ${data.error.message || 'Unknown API Exception'} (Status: ${data.error.status || 'ERROR'})` 
      });
    }

    const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textReply) {
      console.warn("Gemini API response content parts are empty. Response structure:", JSON.stringify(data));
      return res.json({ reply: "Triage Alert: Google Gemini API returned empty candidate content. Check request parameters." });
    }

    res.json({ reply: textReply.trim() });
  } catch (error) {
    console.error("Gemini API Connection Error:", error);
    res.json({ reply: `[Triage Failover] Offline. Failed to contact Gemini API gateway: ${error.message}` });
  }
});

// REST endpoint to trigger simulation programmatically (optional integration)
app.post('/api/simulate', (req, res) => {
  triggerCrisis();
  res.json({ message: 'Incident simulated successfully' });
});

// REST endpoint to reset demo state
app.post('/api/reset', (req, res) => {
  resetDemo();
  res.json({ message: 'Demo reset successfully' });
});

server.listen(PORT, () => {
  console.log(`Overdrive AI backend running on http://localhost:${PORT}`);
});
