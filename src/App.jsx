import React, { useState, useEffect, useRef } from 'react';
import AgentCore from './components/AgentCore';
import HijackedTimeline from './components/HijackedTimeline';
import TriageStream from './components/TriageStream';
import DriveExplorer from './components/DriveExplorer';
import { 
  playConfirm, 
  playCancel, 
  playMitigated, 
  playAlert, 
  playKeystroke 
} from './utils/audio';
import { 
  LayoutDashboard, 
  Calendar, 
  History, 
  SlidersHorizontal, 
  Shield, 
  Clock, 
  Menu, 
  X,
  AlertTriangle,
  Mail,
  HardDrive,
  Search,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Mic
} from 'lucide-react';

export default function App() {
  const [state, setState] = useState('idle'); // idle | critical | thinking | mitigated
  const [activeCards, setActiveCards] = useState([]);
  const [logs, setLogs] = useState([]);
  const [overrideActive, setOverrideActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Tab Navigation State
  const [activeTab, setActiveTab] = useState('diagnostics'); // diagnostics | inbox | calendar | drive
  const [theme, setTheme] = useState('dark'); // dark | light
  const [isMuted, setIsMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Login & User Profile States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('Manan Shah');
  const [emailInput, setEmailInput] = useState('manan.shah@university.edu');
  const [passwordInput, setPasswordInput] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Set global audio state on volume changes
  useEffect(() => {
    window.isAudioMuted = isMuted;
  }, [isMuted]);

  // Progressive Disclosure toggle
  const [advancedMode, setAdvancedMode] = useState(false);
  // Mobile sidebar menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Calendar State Configuration
  const [calendarEvents, setCalendarEvents] = useState([
    {
      id: 'cal-1',
      time: '09:00 - 10:30',
      startHour: 9,
      durationHours: 1.5,
      title: 'CS401: Advanced Software Systems',
      status: 'NORMAL',
      action: 'Attended lecture series. Session sync complete.',
      isMuted: false
    },
    {
      id: 'cal-2',
      time: '12:00 - 13:00',
      startHour: 12,
      durationHours: 1,
      title: 'Team Deliverables Project Sync',
      status: 'MUTED',
      action: 'Bypassed. Auto-sent reschedule notification to workspace.',
      isMuted: false,
      isConflict: false
    },
    {
      id: 'cal-3',
      time: '14:00 - 15:30',
      startHour: 14,
      durationHours: 1.5,
      title: 'Lecture: Human-Computer Interaction',
      status: 'NORMAL',
      action: 'Attended. Notes compiled to local repository.',
      isMuted: false
    },
    {
      id: 'cal-4',
      time: '18:00 - 22:00',
      startHour: 18,
      durationHours: 4,
      title: '[AI LOCKDOWN] CS401 Realignment Zone',
      status: 'ACTIVE LOCK',
      action: 'Enforcing Deep Work. Muting communications & blocking social apps.',
      isLockdown: true,
      isCrisisZone: false
    },
    {
      id: 'cal-5',
      time: '22:00',
      startHour: 22,
      durationHours: 0.5,
      title: 'TARGET DEADLINE: CS401 Presentation Sync',
      status: 'NORMAL',
      action: 'Submission complete.',
      isDeadline: true
    }
  ]);

  // Copilot States
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    { sender: 'agent', text: "Hello! I am your Overdrive Triage Copilot. Ask me to check system status, show calendar conflicts, draft emails, or analyze rules." }
  ]);
  const [copilotTyping, setCopilotTyping] = useState(false);

  // Copilot Message Router (Queries Gemini backend API)
  const sendCopilotMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { sender: 'user', text };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotQuery('');
    playKeystroke();

    setCopilotTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, contextState: state })
      });
      const data = await response.json();
      setCopilotMessages(prev => [...prev, { sender: 'agent', text: data.reply }]);
      playConfirm();
    } catch (err) {
      console.error("Backend Chat Error:", err);
      // Local fallback in case server is not running or offline
      let reply = "";
      const lower = text.toLowerCase();
      if (lower.includes("status") || lower.includes("state")) {
        reply = `[Local] System Status is currently "${state.toUpperCase()}". Guard shield is active.`;
      } else if (lower.includes("conflict") || lower.includes("calendar") || lower.includes("reschedule")) {
        const conflicts = calendarEvents.filter(e => e.isConflict);
        if (conflicts.length > 0) {
          reply = `[Local] Detected calendar conflict: "${conflicts[0].title}". You can resolve this clickably in the Calendar tab.`;
        } else {
          reply = "[Local] All calendar accounts are aligned and conflict-free.";
        }
      } else if (lower.includes("hello") || lower.includes("hi")) {
        reply = "[Local] Greetings! How can I assist you with today's deliverables?";
      } else {
        reply = "[Local] Standing by. Chat backend offline. Set your GEMINI_API_KEY in the environment.";
      }
      setCopilotMessages(prev => [...prev, { sender: 'agent', text: reply }]);
    } finally {
      setCopilotTyping(false);
    }
  };

  // Calendar Reschedule Trigger Handler
  const rescheduleEvent = (id) => {
    setCalendarEvents(prev => prev.map(evt => {
      if (evt.id === id) {
        return {
          ...evt,
          isConflict: false,
          isMuted: false,
          status: 'RESOLVED',
          action: 'Rescheduled: Sunday, June 28 at 11:00 AM.'
        };
      }
      return evt;
    }));

    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const newLog = {
      id: Math.random().toString(),
      time: timestamp,
      type: 'RESOLVED',
      message: 'RESOLVED: Rescheduled conflicting Project Sync to Sunday 11:00 AM.'
    };
    setLogs(prev => [newLog, ...prev]);

    playConfirm();
  };

  // Voice Search / Dictation helper (Web Speech API)
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      playConfirm();
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setSearchQuery(text);
      playConfirm();
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };
  // Real-time autonomous thoughts
  const [thoughtLog, setThoughtLog] = useState([
    "MONITORING: All calendar accounts and submission channels secure. System running background syncs..."
  ]);

  const timerRef = useRef(null);

  // WebSocket Server Connection Hook (Auto-reconnecting client)
  const [socket, setSocket] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [socketRetry, setSocketRetry] = useState(0);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
    
    ws.onopen = () => {
      console.log('Connected to Overdrive AI live backend.');
      setIsLiveConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'SYNC_STATE') {
          const { state: serverState, activeCards: serverCards, logs: serverLogs, thoughtLog: serverThoughts } = data.payload;
          setState(serverState);
          setActiveCards(serverCards);
          setLogs(serverLogs);
          setThoughtLog(serverThoughts);
        }
      } catch (err) {
        console.error('Error parsing backend WS message:', err);
      }
    };

    ws.onclose = () => {
      setIsLiveConnected(false);
      setSocket(null);
      const timeout = setTimeout(() => {
        setSocketRetry(prev => prev + 1);
      }, 4000);
      return () => clearTimeout(timeout);
    };

    ws.onerror = () => {
      // Ignored: ws.onclose handles connection loss
    };

    return () => {
      ws.close();
    };
  }, [socketRetry]);

  // Update clock every second
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  // Trigger deadline crisis simulation
  const triggerCrisis = () => {
    playAlert();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'TRIGGER_CRISIS' }));
      return;
    }

    setState('critical');
    
    // Ingest the initial crisis tasks
    setActiveCards([
      {
        id: 'email-1',
        title: 'Auto-Drafted Extension Request',
        type: 'email',
        countdown: 30, // 30 seconds countdown
        details: {
          to: 'prof.jani@university.edu',
          subject: 'CS401 Presentation Material Sync Delay',
          body: "Dear Professor Jani,\n\nI am writing on behalf of my team to request a brief 12-hour grace period for tonight's CS401 Presentation Submission. We encountered a critical database compile block at compile time and need to execute a manual rebuild.\n\nThank you,\nAutonomous Overdrive Core (Authorized Triage Mode)"
        }
      },
      {
        id: 'slack-1',
        title: 'Slack Reschedule Notification',
        type: 'notification',
        details: {
          message: "Apologies team, I have a critical deadline conflict with CS401 tonight and must request rescheduling our sync. I will follow up tomorrow."
        }
      },
      {
        id: 'tasks-1',
        title: 'AI Micro-Triage Pipeline',
        type: 'tasks',
        details: {
          tasks: [
            { title: 'Scan missing compile deliverables', status: 'completed' },
            { title: 'Draft extension grace period request', status: 'completed' },
            { title: 'Notify dinner group and mute notifications', status: 'active' },
            { title: 'Deploy focus mode slide generation', status: 'queued' }
          ]
        }
      }
    ]);

    setCalendarEvents(prev => prev.map(evt => {
      if (evt.id === 'cal-2') {
        return { ...evt, isConflict: true, isMuted: false, status: 'MUTED', action: 'Bypassed. Auto-sent reschedule notification to workspace.' };
      }
      if (evt.id === 'cal-1' || evt.id === 'cal-3') {
        return { ...evt, isMuted: true };
      }
      if (evt.id === 'cal-4') {
        return { ...evt, isCrisisZone: true };
      }
      if (evt.id === 'cal-5') {
        return { ...evt, status: 'CRITICAL', action: 'Requires urgent presentation slide compilation.' };
      }
      return evt;
    }));

    setThoughtLog([
      "ALERT: High-priority deadline variance detected: CS401 presentation incomplete.",
      "HIJACKING: Enforcing proactive conflict resolution protocols. Muting all active communication channels.",
      "AUTO-DRAFTING: Generated extension request email. Launching approval countdown."
    ]);

    playAlert();
  };

  // Master Demo Reset Function (Shift + R)
  const resetDemo = () => {
    playConfirm();
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'RESET_DEMO' }));
      return;
    }

    setState('idle');
    setActiveCards([]);
    setLogs([]);
    setOverrideActive(false);
    setCalendarEvents([
      {
        id: 'cal-1',
        time: '09:00 - 10:30',
        startHour: 9,
        durationHours: 1.5,
        title: 'CS401: Advanced Software Systems',
        status: 'NORMAL',
        action: 'Attended lecture series. Session sync complete.',
        isMuted: false
      },
      {
        id: 'cal-2',
        time: '12:00 - 13:00',
        startHour: 12,
        durationHours: 1,
        title: 'Team Deliverables Project Sync',
        status: 'MUTED',
        action: 'Bypassed. Auto-sent reschedule notification to workspace.',
        isMuted: false,
        isConflict: false
      },
      {
        id: 'cal-3',
        time: '14:00 - 15:30',
        startHour: 14,
        durationHours: 1.5,
        title: 'Lecture: Human-Computer Interaction',
        status: 'NORMAL',
        action: 'Attended. Notes compiled to local repository.',
        isMuted: false
      },
      {
        id: 'cal-4',
        time: '18:00 - 22:00',
        startHour: 18,
        durationHours: 4,
        title: '[AI LOCKDOWN] CS401 Realignment Zone',
        status: 'ACTIVE LOCK',
        action: 'Enforcing Deep Work. Muting communications & blocking social apps.',
        isLockdown: true,
        isCrisisZone: false
      },
      {
        id: 'cal-5',
        time: '22:00',
        startHour: 22,
        durationHours: 0.5,
        title: 'TARGET DEADLINE: CS401 Presentation Sync',
        status: 'NORMAL',
        action: 'Submission complete.',
        isDeadline: true
      }
    ]);
    setThoughtLog([
      "Executing proactive conflict resolution protocols. System stability verified."
    ]);
  };

  // Auto-decrement countdowns for active cards
  useEffect(() => {
    if (isLiveConnected) return; // Disable local timers if backend handles them
    if (state !== 'critical' || activeCards.length === 0) return;

    timerRef.current = setInterval(() => {
      setActiveCards((prevCards) => {
        if (prevCards.length === 0) return prevCards;

        // Decrement the first card with countdown
        const updated = prevCards.map((card, idx) => {
          if (idx === 0 && card.countdown !== undefined && card.countdown > 0) {
            return { ...card, countdown: card.countdown - 1 };
          }
          return card;
        });

        // Trigger auto-approval if countdown hits 0
        const firstCard = updated[0];
        if (firstCard && firstCard.countdown === 0 && !firstCard.isDissolving) {
          clearInterval(timerRef.current);
          approveCard(firstCard.id);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [state, activeCards]);

  // Action: Approve & Send Card
  const approveCard = (cardId) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isDissolving: true } : c))
    );

    playConfirm();

    // Add delay for green dissolve effect before removal
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'APPROVE_CARD', payload: { cardId } }));
        return;
      }

      setActiveCards((prev) => {
        const cardToApprove = prev.find((c) => c.id === cardId);
        if (!cardToApprove) return prev;

        const nextCards = prev.filter((c) => c.id !== cardId);

        // Log the mitigation
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });
        let message = '';
        let type = 'DISPATCHED';

        if (cardToApprove.type === 'email') {
          message = `Email delivered to ${cardToApprove.details.to}. Mitigated high-priority deadline variance.`;
          setThoughtLog((t) => [
            ...t,
            "DISPATCHED: Extension request email transmitted. Response expected in 2h.",
            "TRIAGING: Initiating automated slide draft compilation..."
          ]);
        } else if (cardToApprove.type === 'notification') {
          message = `Apology draft transmitted to primary communication channels.`;
          setThoughtLog((t) => [
            ...t,
            "RESOLVED: Calendar conflict cleared. Distractions suppressed."
          ]);
          // Automatically reschedule the conflicting calendar slot cal-2
          setCalendarEvents(prev => prev.map(evt => {
            if (evt.id === 'cal-2') {
              return {
                ...evt,
                isConflict: false,
                isMuted: false,
                status: 'RESOLVED',
                action: 'Rescheduled: Sunday, June 28 at 11:00 AM.'
              };
            }
            return evt;
          }));
        } else {
          message = `Broke down task pipeline: Focus slide generator running.`;
        }

        setLogs((currentLogs) => [
          {
            id: Math.random().toString(),
            time: timestamp,
            type,
            message
          },
          ...currentLogs
        ]);

        // If no more cards, transition to mitigated state
        if (nextCards.length === 0 || (nextCards.length === 1 && nextCards[0].type === 'tasks')) {
          setState('mitigated');
          playMitigated();
          setThoughtLog((t) => [
            ...t,
            "MITIGATED: Crisis triaged successfully. Submission extension pending. Focus lock released."
          ]);
          return [];
        }

        return nextCards;
      });
    }, 450);
  };

  // Action: Abort Card
  const abortCard = (cardId) => {
    setActiveCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isDissolving: true } : c))
    );

    playCancel();

    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ABORT_CARD', payload: { cardId } }));
        return;
      }

      setActiveCards((prev) => {
        const cardToAbort = prev.find((c) => c.id === cardId);
        if (!cardToAbort) return prev;

        const nextCards = prev.filter((c) => c.id !== cardId);
        const timestamp = new Date().toLocaleTimeString([], { hour12: false });

        setLogs((currentLogs) => [
          {
            id: Math.random().toString(),
            time: timestamp,
            type: 'ABORTED',
            message: `User manually aborted action: "${cardToAbort.title}"`
          },
          ...currentLogs
        ]);

        setThoughtLog((t) => [
          ...t,
          `WARNING: User manually aborted autonomous action: "${cardToAbort.title}". Adjusting parameters...`
        ]);

        if (nextCards.length === 0 || (nextCards.length === 1 && nextCards[0].type === 'tasks')) {
          setState('mitigated');
          playMitigated();
          return [];
        }

        return nextCards;
      });
    }, 450);
  };

  // Master Reset Keyboard Binding Shift+R bypassed. Click events take precedence.

  // Find remaining seconds for the active card to display on Dashboard badge
  const getActiveCountdown = () => {
    if (activeCards.length > 0 && activeCards[0].countdown !== undefined) {
      return `${activeCards[0].countdown}s`;
    }
    return 'CRISIS';
  };

  // Dynamic color badge resolver for Triage History log
  const getHistoryBadgeClass = () => {
    if (state === 'critical' || state === 'thinking') {
      return 'bg-overdrive-crimson/10 text-overdrive-crimson border-overdrive-crimson/25 animate-pulse';
    }
    if (state === 'mitigated') {
      return 'bg-cyber-emerald/10 text-cyber-emerald border-cyber-emerald/25 font-bold';
    }
    return 'bg-slate-800 border-slate-700 text-slate-400';
  };

  const isDark = theme === 'dark';

  if (!isLoggedIn) {
    return (
      <div className={`relative min-h-screen w-full flex items-center justify-center p-6 transition-colors duration-150 ${
        isDark ? 'bg-[#020617] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]'
      }`}>
        {isDark && <div className="crt-overlay" />}
        
        {/* Sleek Login Panel Card */}
        <div className={`max-w-md w-full p-8 border rounded-2xl transition-all duration-150 ${
          isDark ? 'bg-[#090d16] border-slate-800/80 shadow-2xl' : 'bg-white border-slate-200 shadow-lg'
        }`}>
          <div className="flex flex-col items-center text-center mb-8">
            {/* Cool Interlocking Logo */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
              isDark ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50 border border-slate-150'
            }`}>
              <svg className="w-10 h-10 text-kinetic-cyan filter drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase font-mono">
              OVERDRIVE AI
            </h2>
            <p className={`text-[10px] font-mono mt-1.5 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-700 font-bold'}`}>
              Autonomous Triage Control Login
            </p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            setIsLoggedIn(true);
            playConfirm();
          }} className="space-y-5 font-mono text-xs">
            <div>
              <label className={`block mb-1.5 uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-900'}`}>
                Workspace Email Address
              </label>
              <input 
                type="email" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className={`w-full border rounded-lg px-3.5 py-2.5 transition-colors focus:outline-none ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                    : 'bg-slate-50 border-slate-250 text-slate-900 font-bold focus:border-slate-350 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block mb-1.5 uppercase tracking-wider font-bold ${isDark ? 'text-slate-400' : 'text-slate-900'}`}>
                Master Authorization Key
              </label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter passcode..."
                required
                className={`w-full border rounded-lg px-3.5 py-2.5 transition-colors focus:outline-none ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                    : 'bg-slate-50 border-slate-250 text-slate-900 font-bold focus:border-slate-350 focus:bg-white'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-kinetic-cyan hover:bg-cyan-500 text-[#020617] font-black uppercase text-xs tracking-wider transition-all duration-155 active:scale-97 shadow"
            >
              Sign In to Workspace
            </button>
          </form>

          <div className={`mt-6 pt-5 border-t text-center text-[9px] font-mono tracking-widest ${isDark ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-500'}`}>
            SECURED WITH SHA-256 ISOLATION
          </div>
        </div>

        {/* Floating Theme Toggle on Login Screen */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 rounded-lg border transition-all duration-150 active:scale-97 ${
              isDark 
                ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-400 hover:text-slate-200' 
                : 'border-slate-250 bg-slate-50 hover:border-slate-350 text-slate-600 hover:text-slate-850'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full overflow-hidden flex flex-col md:flex-row font-sans transition-colors duration-150 ${
      isDark ? 'bg-[#020617] text-[#f8fafc]' : 'bg-[#f8fafc] text-[#0f172a]'
    }`}>
      
      {/* High-Performance Static Scanline overlay */}
      {isDark && <div className="crt-overlay" />}

      {/* MOBILE HEADER BAR */}
      <div className={`md:hidden flex items-center justify-between p-4 z-40 w-full ${
        isDark ? 'bg-[#090d16] border-b border-slate-800' : 'bg-white border-b border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-kinetic-cyan flex items-center justify-center font-bold text-[#020617] font-mono text-sm">
            Ω
          </div>
          <span className="font-mono font-bold tracking-widest text-sm">OVERDRIVE</span>
        </div>
        <div className="flex items-center space-x-3">
          {state === 'critical' && (
            <span className="w-2.5 h-2.5 rounded-full bg-overdrive-amber animate-ping" />
          )}
          <button 
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-1 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-650 hover:text-slate-850'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col justify-between shrink-0 z-30 transition-all duration-300 ${
        mobileMenuOpen 
          ? isDark ? 'absolute top-[53px] left-0 right-0 bottom-0 bg-[#090d16]' : 'absolute top-[53px] left-0 right-0 bottom-0 bg-slate-100'
          : 'hidden md:flex md:h-screen'
      } ${
        isDark ? 'bg-[#090d16] border-slate-800/80' : 'bg-slate-100 border-slate-350'
      }`}>
        {/* Brand Identity */}
        <div className={`hidden md:flex p-6 border-b flex-col gap-1 ${isDark ? 'border-slate-800/40' : 'border-slate-300'}`}>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              state === 'critical' ? 'animate-pulse' : ''
            }`}>
              <svg className={`w-8 h-8 text-kinetic-cyan filter ${
                state === 'critical' ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] text-overdrive-crimson' : 'drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]'
              }`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest uppercase font-mono leading-none">
                Overdrive AI
              </h1>
              <p className={`text-[10px] font-mono mt-1 uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-850 font-black'}`}>
                TACTICAL CONTROL V1.1
              </p>
            </div>
          </div>
        </div>

        {/* Tab Links - Diagnostics First */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
          {/* Diagnostics Link */}
          <button
            id="sidebar-nav-diagnostics"
            onClick={() => {
              setActiveTab('diagnostics');
              setMobileMenuOpen(false);
              playKeystroke();
            }}
            className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all duration-150 ${
              activeTab === 'diagnostics'
                ? isDark 
                  ? 'bg-slate-950/50 text-kinetic-cyan border-l-2 border-kinetic-cyan' 
                  : 'bg-cyan-100/60 text-cyan-950 border-l-2 border-cyan-600'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-950/20 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-200/60 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <Shield className="w-5 h-5" />
              <span>Diagnostics</span>
            </div>
            {logs.length > 0 && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getHistoryBadgeClass()}`}>
                {logs.length}
              </span>
            )}
          </button>

          {/* Mail Triage Inbox Link */}
          <button
            id="sidebar-nav-inbox"
            onClick={() => {
              setActiveTab('inbox');
              setMobileMenuOpen(false);
              playKeystroke();
            }}
            className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all duration-150 ${
              activeTab === 'inbox'
                ? isDark 
                  ? 'bg-slate-950/50 text-kinetic-cyan border-l-2 border-kinetic-cyan' 
                  : 'bg-cyan-100/60 text-cyan-950 border-l-2 border-cyan-600'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-950/20 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-200/60 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <Mail className="w-5 h-5" />
              <span>Mail Inbox</span>
            </div>
            {state === 'critical' && activeTab !== 'inbox' && (
              <span className="flex items-center justify-center text-[10px] font-mono font-bold bg-overdrive-amber/15 text-overdrive-amber px-2 py-0.5 rounded border border-overdrive-amber/30 animate-pulse-fast view-fade-in">
                {getActiveCountdown()}
              </span>
            )}
          </button>

          {/* Calendar Link */}
          <button
            id="sidebar-nav-calendar"
            onClick={() => {
              setActiveTab('calendar');
              setMobileMenuOpen(false);
              playKeystroke();
            }}
            className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all duration-150 ${
              activeTab === 'calendar'
                ? isDark 
                  ? 'bg-slate-950/50 text-kinetic-cyan border-l-2 border-kinetic-cyan' 
                  : 'bg-cyan-100/60 text-cyan-950 border-l-2 border-cyan-600'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-950/20 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-200/60 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <Calendar className="w-5 h-5" />
              <span>Calendar</span>
            </div>
            {state === 'critical' && (
              <span className="w-1.5 h-1.5 rounded-full bg-overdrive-crimson animate-ping" />
            )}
          </button>

          {/* Drive Link */}
          <button
            id="sidebar-nav-drive"
            onClick={() => {
              setActiveTab('drive');
              setMobileMenuOpen(false);
              playKeystroke();
            }}
            className={`flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all duration-150 ${
              activeTab === 'drive'
                ? isDark 
                  ? 'bg-slate-950/50 text-kinetic-cyan border-l-2 border-kinetic-cyan' 
                  : 'bg-cyan-100/60 text-cyan-950 border-l-2 border-cyan-600'
                : isDark
                  ? 'text-slate-400 hover:bg-slate-950/20 hover:text-slate-200'
                  : 'text-slate-900 hover:bg-slate-200/60 hover:text-slate-950'
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <HardDrive className="w-5 h-5" />
              <span>Drive Files</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Controls Footer */}
        <div className={`p-4 border-t flex flex-col gap-3 ${isDark ? 'border-slate-800/40' : 'border-slate-100'}`}>
          {/* Progressive Disclosure Toggle */}
          <button
            id="sidebar-advanced-toggle"
            onClick={() => {
              setAdvancedMode(!advancedMode);
              playKeystroke();
            }}
            className={`flex items-center justify-between w-full p-3.5 rounded-xl text-xs font-mono transition-all duration-150 ${
              advancedMode ? 'bg-[#06b6d4]/10 text-kinetic-cyan border border-[#06b6d4]/20' : isDark ? 'text-slate-400 border border-transparent hover:bg-slate-900/60' : 'text-slate-850 font-bold border border-transparent hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Advanced Diagnostics</span>
            </div>
            <span className={`w-4 h-2 rounded-full transition-colors duration-150 relative ${
              advancedMode ? 'bg-kinetic-cyan' : 'bg-slate-700'
            }`}>
              <span className={`absolute top-0.5 w-1 h-1 rounded-full bg-white transition-all duration-150 ${
                advancedMode ? 'right-0.5' : 'left-0.5'
              }`} />
            </span>
          </button>

          {/* Core Info - Progressive Disclosure */}
          {advancedMode && (
            <div className={`text-[10px] font-mono uppercase tracking-widest px-1 py-1 flex flex-col gap-1 view-fade-in ${
              isDark ? 'text-slate-500' : 'text-slate-900 font-bold'
            }`}>
              <div className="flex justify-between">
                <span>FOCUS CONTROL:</span>
                <span className={overrideActive ? 'text-overdrive-amber font-bold' : 'text-cyber-emerald font-black'}>
                  {overrideActive ? 'BYPASSED' : 'ENFORCED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Threat Profile:</span>
                <span className={state === 'critical' ? 'text-overdrive-crimson font-bold' : isDark ? 'text-slate-450' : 'text-slate-900 font-black'}>
                  {state === 'critical' ? 'CRITICAL' : 'SECURE'}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT PANEL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOP STATUS BAR */}
        <header className={`hidden md:flex w-full px-8 py-5 items-center justify-between transition-colors duration-150 ${
          isDark ? 'bg-[#030712] border-b border-slate-800/80' : 'bg-white border-b border-slate-200 shadow-sm'
        }`}>          {/* Functional Search Bar */}
          <div className="flex-1 max-w-lg relative flex items-center transition-all duration-150">
            {(activeTab === 'inbox' || activeTab === 'drive') ? (
              <div className="w-full relative flex items-center view-fade-in">
                <Search className="absolute left-3 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab === 'inbox' ? 'Mail Inbox' : 'Drive Files'}...`} 
                  className={`w-full border rounded-lg pl-9 pr-10 py-2 text-xs font-mono tracking-wide placeholder-slate-500 focus:outline-none transition-colors duration-150 ${
                    isDark 
                      ? 'bg-slate-950/60 border-slate-900 text-slate-205 focus:border-slate-800' 
                      : 'bg-slate-50 border-slate-250 text-slate-800 focus:border-slate-350 focus:bg-white'
                  }`}
                />
                {/* Dictation Dictate Mic Button */}
                <button
                  id="btn-voice-search"
                  onClick={startSpeechRecognition}
                  className={`absolute right-3 p-1 rounded hover:bg-slate-900/10 transition-colors ${
                    isListening ? 'text-overdrive-crimson animate-pulse' : 'text-slate-400 hover:text-slate-650'
                  }`}
                  title="Voice Dictation / Speech-to-Search"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest select-none view-fade-in">
                SYSTEM OPERATIONAL // PORT STATUS: OK
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6 font-mono text-[10px] text-slate-400">
            {/* Theme switcher & volume control group */}
            <div className="flex items-center space-x-2">
              {/* Theme toggle */}
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                  playKeystroke();
                }}
                className={`p-1.5 rounded-lg border transition-all duration-150 active:scale-97 ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-400 hover:text-slate-200' 
                    : 'border-slate-250 bg-slate-50 hover:border-slate-350 text-slate-600 hover:text-slate-850'
                }`}
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Volume Mute Toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg border transition-all duration-150 active:scale-97 ${
                  isDark 
                    ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-400 hover:text-slate-200' 
                    : 'border-slate-250 bg-slate-50 hover:border-slate-350 text-slate-600 hover:text-slate-850'
                }`}
                title={isMuted ? 'Unmute system sounds' : 'Mute system sounds'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Live Server Indicator Capsule */}
            <div className={`flex items-center space-x-1.5 border px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-wider ${
              isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-300 bg-slate-50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-cyber-emerald animate-pulse' : 'bg-slate-600'}`} />
              <span className={isLiveConnected ? 'text-cyber-emerald font-bold' : isDark ? 'text-slate-500' : 'text-slate-900 font-black'}>
                {isLiveConnected ? 'LIVE BACKEND' : 'OFFLINE STANDALONE'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-700'}`} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-900 font-bold'}>TIME:</span>
              <span className={`font-bold tracking-widest ${isDark ? 'text-[#f8fafc]' : 'text-slate-950 font-black'}`}>{formatTime(currentTime)}</span>
            </div>            {/* Copilot Toggle button */}
            <button
              onClick={() => {
                setCopilotOpen(!copilotOpen);
                playKeystroke();
              }}
              className={`flex items-center space-x-1.5 font-mono text-xs uppercase font-bold py-1.5 px-3 rounded-lg border transition-all duration-150 active:scale-97 ${
                copilotOpen
                  ? 'bg-kinetic-cyan text-[#020617] border-kinetic-cyan'
                  : isDark
                    ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-350'
                    : 'border-slate-250 bg-slate-50 hover:border-slate-355 text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>💬 Copilot</span>
            </button>

            {/* User Profile avatar capsule */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center space-x-2.5 py-1.5 px-3 rounded-lg border transition-all duration-150 active:scale-97 ${
                  profileDropdownOpen
                    ? 'border-kinetic-cyan text-kinetic-cyan'
                    : isDark
                      ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700 text-slate-350'
                      : 'border-slate-250 bg-slate-50 hover:border-slate-355 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${
                  isDark ? 'bg-slate-900 text-kinetic-cyan' : 'bg-slate-200 text-slate-900 font-extrabold'
                }`}>
                  MS
                </div>
                <span className="hidden lg:inline text-[9px] font-bold tracking-wider">{username}</span>
              </button>

              {/* Profile Dropdown modal */}
              {profileDropdownOpen && (
                <div className={`absolute right-0 mt-2.5 w-64 rounded-xl border p-4 shadow-2xl z-50 font-mono text-[10px] space-y-3.5 ${
                  isDark ? 'bg-[#090d16] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
                }`}>
                  <div className="flex items-center space-x-3 border-b pb-3 border-slate-900/40">
                    <div className="w-8 h-8 rounded-full bg-kinetic-cyan flex items-center justify-center font-bold text-[#020617] text-xs">
                      MS
                    </div>
                    <div>
                      <h4 className={`font-black ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>{username}</h4>
                      <p className={`text-[8px] uppercase mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-705 font-black'}`}>{emailInput}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Security Clearance:</span>
                      <span className="text-cyber-emerald font-bold">LEVEL 4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Node Status:</span>
                      <span className="text-cyber-emerald font-bold">AUTHORIZED</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Linked Channels:</span>
                      <span className="text-kinetic-cyan font-bold">MAIL, CALENDAR, DRIVE</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setProfileDropdownOpen(false);
                      setPasswordInput('');
                      playConfirm();
                    }}
                    className="w-full py-2.5 rounded bg-overdrive-crimson/10 border border-overdrive-crimson/30 hover:bg-overdrive-crimson/20 text-overdrive-crimson font-bold text-[9px] uppercase tracking-wider transition-colors"
                  >
                    Sign Out / Revoke Key
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB PORT - SCROLLABLE MAIN BODY WITH PERSISTENT STATE */}
        <div className="flex-1 p-8 overflow-y-auto max-w-7xl w-full mx-auto flex flex-col gap-6">
          
          {/* Global Summary Metric Row */}
          {activeTab !== 'drive' && activeTab !== 'diagnostics' && (
            <div className="grid grid-cols-3 gap-6 view-fade-in">
              <div className={`border p-4 rounded-xl flex items-center justify-between font-mono ${
                isDark ? 'bg-[#090d16]/40 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <span className={`uppercase tracking-wider text-[10px] font-bold ${isDark ? 'text-slate-550' : 'text-slate-900 font-black'}`}>Deadlines Guarded</span>
                <span className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-slate-950'}`}>4</span>
              </div>
              <div className={`border p-4 rounded-xl flex items-center justify-between font-mono ${
                isDark ? 'bg-[#090d16]/40 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <span className={`uppercase tracking-wider text-[10px] font-bold ${isDark ? 'text-slate-550' : 'text-slate-900 font-black'}`}>Time Reclaimed</span>
                <span className={`text-base font-bold ${isDark ? 'text-[#f8fafc]' : 'text-slate-950'}`}>2.5 Hours</span>
              </div>
              <div className={`border p-4 rounded-xl flex items-center justify-between font-mono ${
                isDark ? 'bg-[#090d16]/40 border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <span className={`uppercase tracking-wider text-[10px] font-bold ${isDark ? 'text-slate-550' : 'text-slate-900 font-black'}`}>System Integrity</span>
                <span className="text-cyber-emerald text-base font-bold text-glow-emerald">100%</span>
              </div>
            </div>
          )}

          {/* TAB 1: MAIL INBOX */}
          {activeTab === 'inbox' && (
            <div className="view-fade-in flex-1">
              <TriageStream 
                state={state}
                activeCards={activeCards}
                logs={logs}
                onApproveCard={approveCard}
                onAbortCard={abortCard}
                advancedMode={advancedMode}
                theme={theme}
                searchQuery={searchQuery}
              />
            </div>
          )}

          {/* TAB 2: CALENDAR VIEW */}
          {activeTab === 'calendar' && (
            <div className="view-fade-in flex-1 max-w-4xl mx-auto w-full">
              <HijackedTimeline 
                state={state} 
                advancedMode={advancedMode}
                theme={theme}
                searchQuery={searchQuery}
                calendarEvents={calendarEvents}
                onRescheduleEvent={rescheduleEvent}
              />
            </div>
          )}

          {/* TAB 3: DRIVE FILES */}
          {activeTab === 'drive' && (
            <div className="view-fade-in flex-1">
              <DriveExplorer 
                state={state}
                logs={logs}
                advancedMode={advancedMode}
                theme={theme}
                searchQuery={searchQuery}
              />
            </div>
          )}

          {/* TAB 4: AGENT DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="view-fade-in flex flex-col lg:flex-row gap-8 items-stretch w-full">
              <div className="flex-1">
                <AgentCore 
                  state={state} 
                  onTriggerCrisis={triggerCrisis} 
                  thoughtLog={thoughtLog}
                  advancedMode={advancedMode}
                  theme={theme}
                />
              </div>
              <div className={`w-full lg:w-[400px] flex flex-col p-6 rounded-2xl border ${
                isDark ? 'bg-[#090d16] border-slate-800/80 text-slate-350' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}>
                <h3 className={`text-xs font-bold font-mono uppercase tracking-wider border-b pb-3 mb-4 ${
                  isDark ? 'text-slate-200 border-slate-900' : 'text-slate-850 border-slate-100'
                }`}>
                  Full Resolution Audit Registry
                </h3>
                <div className="flex-grow overflow-y-auto max-h-[300px] lg:max-h-[none] pr-1">
                  {logs.length === 0 ? (
                    <div className={`h-48 flex items-center justify-center border border-dashed rounded-xl text-xs italic font-mono ${
                      isDark ? 'border-slate-900 text-slate-500' : 'border-slate-250 text-slate-400'
                    }`}>
                      No resolution records in active session log.
                    </div>
                  ) : (
                    (() => {
                      const filteredLogs = logs.filter(log => {
                        const query = searchQuery.toLowerCase();
                        return log.time.toLowerCase().includes(query) || 
                               log.type.toLowerCase().includes(query) || 
                               log.message.toLowerCase().includes(query);
                      });

                      if (filteredLogs.length === 0) {
                        return (
                          <div className={`h-48 flex items-center justify-center border border-dashed rounded-xl text-xs italic font-mono ${
                            isDark ? 'border-slate-900 text-slate-500' : 'border-slate-250 text-slate-400'
                          }`}>
                            No logs matching "{searchQuery}"
                          </div>
                        );
                      }

                      return (
                        <div className={`border rounded-xl overflow-hidden font-mono text-[10px] ${
                          isDark ? 'border-slate-900' : 'border-slate-200'
                        }`}>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className={`border-b text-[9px] font-bold uppercase tracking-wider ${
                                isDark ? 'bg-slate-950/60 border-slate-900 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}>
                                <th className="p-3">Time</th>
                                <th className="p-3">Type</th>
                                <th className="p-3">Log Details</th>
                              </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800 bg-slate-950/20' : 'divide-slate-100 bg-slate-50/20'}`}>
                              {filteredLogs.map((log) => (
                                <tr key={log.id} className={`transition-colors ${
                                  isDark ? 'hover:bg-slate-900/30' : 'hover:bg-slate-100/50'
                                }`}>
                                  <td className="p-3 text-slate-500 whitespace-nowrap">{log.time}</td>
                                  <td className="p-3">
                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                                      log.type === 'ABORTED' ? 'bg-overdrive-crimson/5 border-overdrive-crimson/25 text-overdrive-crimson' : 'bg-cyber-emerald/5 border-cyber-emerald/25 text-cyber-emerald'
                                    }`}>
                                      {log.type}
                                    </span>
                                  </td>
                                  <td className={`p-3 truncate max-w-[155px] ${isDark ? 'text-slate-400' : 'text-slate-650'}`} title={log.message}>{log.message}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM SYSTEM FOOTER */}
        <footer className={`w-full border-t py-3.5 text-center text-[9px] font-mono flex items-center justify-center px-6 mt-auto transition-colors duration-150 ${
          isDark ? 'bg-[#030712] border-slate-800/80 text-slate-650' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <span>© 2026 OVERDRIVE AI // AUTONOMOUS TRIAGE SYSTEM. ALL RIGHTS RESERVED.</span>
        </footer>
      </main>

      {/* DOCKED COPILOT PANEL */}
      <aside className={`fixed right-0 top-0 bottom-0 z-50 w-80 md:w-96 border-l flex flex-col justify-between transition-all duration-300 transform shadow-2xl ${
        copilotOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isDark ? 'bg-[#090d16] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Copilot Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800/80 bg-slate-950/20' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-kinetic-cyan animate-pulse" />
            <span className={`text-xs font-bold uppercase font-mono tracking-widest ${isDark ? 'text-slate-200' : 'text-slate-905 font-black'}`}>
              Overdrive Copilot
            </span>
          </div>
          <button 
            onClick={() => setCopilotOpen(false)}
            className={`p-1 rounded hover:bg-slate-900/10 ${isDark ? 'text-slate-400 hover:text-slate-250' : 'text-slate-700 hover:text-slate-950'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-[11px] leading-relaxed">
          {copilotMessages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <span className={`text-[8px] uppercase tracking-wider mb-1 ${
                msg.sender === 'user' ? isDark ? 'text-slate-500' : 'text-slate-805 font-black' : 'text-kinetic-cyan font-bold'
              }`}>
                {msg.sender === 'user' ? 'You' : 'Overdrive Agent'}
              </span>
              <div className={`p-3 rounded-xl max-w-[85%] leading-normal ${
                msg.sender === 'user'
                  ? 'bg-kinetic-cyan text-[#020617] font-bold shadow-sm'
                  : isDark
                    ? 'bg-slate-950 border border-slate-900 text-slate-300'
                    : 'bg-slate-50 border border-slate-250 text-slate-950 font-bold'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {copilotTyping && (
            <div className="flex flex-col items-start animate-pulse">
              <span className="text-[8px] text-kinetic-cyan font-bold uppercase tracking-wider mb-1">Overdrive Agent</span>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-800 font-bold'}`}>
                Typing thoughts...
              </div>
            </div>
          )}
        </div>

        {/* Input Form Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendCopilotMessage(copilotQuery);
            }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              value={copilotQuery}
              onChange={(e) => setCopilotQuery(e.target.value)}
              placeholder="Ask copilot..."
              className={`flex-1 border rounded-lg px-3 py-2 text-xs font-mono focus:outline-none ${
                isDark 
                  ? 'bg-slate-950 border-slate-900 text-slate-200 focus:border-slate-800' 
                  : 'bg-slate-50 border-slate-250 text-slate-900 font-black focus:border-slate-350 focus:bg-white'
              }`}
            />
            <button 
              type="submit"
              className="px-3.5 py-2 rounded-lg bg-kinetic-cyan hover:bg-cyan-500 text-[#020617] font-bold text-xs transition-colors active:scale-97"
            >
              Send
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
