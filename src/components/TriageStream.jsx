import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Ban, 
  Terminal, 
  FileText, 
  MessageSquare, 
  Inbox, 
  Star, 
  Archive, 
  Trash2, 
  User, 
  CornerUpLeft, 
  Clock 
} from 'lucide-react';

export default function TriageStream({ 
  state, 
  activeCards, 
  logs, 
  onApproveCard, 
  onAbortCard,
  advancedMode,
  theme = 'dark',
  searchQuery = ''
}) {
  const isCrisis = state !== 'idle';
  const [selectedMailId, setSelectedMailId] = useState(null);

  // Dynamic Ambient Scan Logs for the Idle State
  const [ambientLogs, setAmbientLogs] = useState([
    { id: '1', time: '16:34:00', task: 'Checking submission server API response', status: '200 OK' },
    { id: '2', time: '16:34:20', task: 'Scanning local repository integrity', status: 'VERIFIED' },
    { id: '3', time: '16:34:40', task: 'Syncing calendar endpoints', status: 'SUCCESS' },
  ]);

  // Filter active cards by search query
  const filteredCards = activeCards.filter(card => {
    const titleMatch = card.title.toLowerCase().includes(searchQuery.toLowerCase());
    const detailMatch = card.details
      ? (card.details.body && card.details.body.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (card.details.message && card.details.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (card.details.subject && card.details.subject.toLowerCase().includes(searchQuery.toLowerCase()))
      : false;
    return titleMatch || detailMatch;
  });

  // Set the first filtered card as selected if current selection is invalid
  useEffect(() => {
    if (filteredCards.length > 0) {
      if (!selectedMailId || !filteredCards.some(c => c.id === selectedMailId)) {
        setSelectedMailId(filteredCards[0].id);
      }
    } else {
      setSelectedMailId(null);
    }
  }, [filteredCards, selectedMailId]);

  useEffect(() => {
    if (isCrisis) return;

    const tasks = [
      'Scanning local repository integrity',
      'Checking submission server API response',
      'Syncing calendar endpoints',
      'Verifying browser focus lock endpoints',
      'Ingesting LMS canvas course deadlines',
      'Refreshing GitHub sync tokens',
      'Checking background daemon health',
      'Testing local IDE compiler parameters',
    ];

    const interval = setInterval(() => {
      setAmbientLogs((prev) => {
        const time = new Date().toLocaleTimeString([], { hour12: false });
        const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
        const newLog = {
          id: Math.random().toString(),
          time,
          task: randomTask,
          status: Math.random() > 0.85 ? 'HEALTHY' : 'SECURE'
        };
        return [...prev.slice(-4), newLog];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isCrisis]);

  // Selected card contents
  const selectedMail = filteredCards.find(c => c.id === selectedMailId);
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full border relative overflow-hidden font-mono transition-colors duration-150 ${
      isDark ? 'bg-[#090d16] border-slate-800/80 text-slate-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    }`}>
      
      {/* Mail-style Header controls */}
      <div className={`flex items-center justify-between border-b p-4 z-10 ${isDark ? 'border-slate-900' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-3 text-slate-400">
          <Inbox className={`w-4 h-4 ${isDark ? 'text-kinetic-cyan' : 'text-cyan-600'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-950'}`}>
            {isCrisis ? `Inbox Message Queue (${filteredCards.filter(c => c.type !== 'tasks').length})` : 'Inbox Message Queue'}
          </span>
        </div>
        
        {isCrisis && (
          <div className={`flex items-center space-x-2.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-800'}`}>
            <button className="p-1 hover:text-kinetic-cyan transition-colors" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
            <button className="p-1 hover:text-kinetic-cyan transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
            <span className="text-slate-700">|</span>
            <span className={`text-[10px] border px-2 py-0.5 rounded uppercase font-semibold ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-250 text-slate-900 font-bold'
            }`}>
              QUEUE: {filteredCards.length}
            </span>
          </div>
        )}
      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch min-h-0">
        
        {/* Left Pane: Inbox List */}
        <div className={`w-full md:w-[280px] border-r overflow-y-auto flex flex-col ${isDark ? 'border-slate-900' : 'border-slate-100 bg-slate-50/15'}`}>
          {isCrisis ? (
            <div className={`divide-y ${isDark ? 'divide-slate-955' : 'divide-slate-150'}`}>
              {filteredCards.filter(c => c.type !== 'tasks').map((card, idx) => {
                const isSelected = card.id === selectedMailId;
                const isEmail = card.type === 'email';
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedMailId(card.id)}
                    className={`p-3.5 cursor-pointer text-left transition-all duration-200 border-l-2 relative ${
                      isSelected 
                        ? isDark
                          ? 'bg-slate-950/60 border-kinetic-cyan text-kinetic-cyan' 
                          : 'bg-cyan-50/30 border-kinetic-cyan text-kinetic-cyan font-bold'
                        : isDark
                          ? 'border-transparent hover:bg-slate-950/20 text-slate-350'
                          : 'border-transparent hover:bg-slate-100/50 text-slate-850 font-semibold'
                    }`}
                  >
                    {/* Inbox item header */}
                    <div className="flex justify-between items-start">
                      <span className={`text-[10px] font-bold tracking-wider truncate max-w-[120px] ${
                        isDark ? 'text-slate-400' : 'text-slate-900 font-black'
                      }`}>
                        {isEmail ? 'Prof. Miller' : 'Overdrive Bot'}
                      </span>
                      {idx === 0 && card.countdown !== undefined && (
                        <span className="text-[8px] bg-overdrive-amber/10 border border-overdrive-amber/30 text-overdrive-amber px-1 rounded animate-pulse">
                          {card.countdown}s
                        </span>
                      )}
                    </div>
                    {/* Subject */}
                    <h4 className={`text-xs mt-1 truncate ${isSelected ? 'font-black text-kinetic-cyan' : isDark ? 'text-slate-300' : 'text-slate-900 font-bold'}`}>
                      {card.title}
                    </h4>
                    {/* Short Snippet */}
                    <p className={`text-[9px] mt-1 truncate leading-normal ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                      {isEmail ? 'Dear Prof. Miller, I am writing to formally request...' : 'Team, I am running slightly behind on the slide deck...'}
                    </p>
                  </div>
                );
              })}
              
              {/* Task list represented as a system pinned folder */}
              {filteredCards.find(c => c.type === 'tasks') && (
                <div 
                  onClick={() => setSelectedMailId(filteredCards.find(c => c.type === 'tasks').id)}
                  className={`p-3.5 cursor-pointer text-left border-l-2 border-transparent transition-all duration-200 ${
                    selectedMailId === filteredCards.find(c => c.type === 'tasks').id
                      ? isDark
                        ? 'bg-slate-950/60 border-kinetic-cyan text-kinetic-cyan' 
                        : 'bg-cyan-50/30 border-kinetic-cyan text-kinetic-cyan font-bold'
                      : isDark
                        ? 'hover:bg-slate-950/20 text-slate-400'
                        : 'hover:bg-slate-100/55 text-slate-850 font-bold'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-900 font-black'}`}>⚙️ Pinned Script</span>
                  <h4 className={`text-xs mt-1 font-semibold truncate ${isDark ? 'text-slate-350' : 'text-slate-900 font-bold'}`}>AI Micro-Triage Pipeline</h4>
                  <p className={`text-[9px] mt-1 truncate ${isDark ? 'text-slate-500' : 'text-slate-750 font-semibold'}`}>Checklist: 6 steps active.</p>
                </div>
              )}
            </div>
          ) : (
            <div className={`p-4 flex flex-col justify-center items-center text-center text-[10px] h-full italic my-auto ${
              isDark ? 'text-slate-600' : 'text-slate-850 font-bold'
            }`}>
              <Inbox className={`w-5 h-5 mb-2 ${isDark ? 'text-slate-800' : 'text-slate-400'}`} />
              Inbox is clean. No active deadline variances detected.
            </div>
          )}
        </div>

        {/* Right Pane: Message Thread Details */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 min-h-[300px]">
          {selectedMail ? (
            <div className="flex-grow flex flex-col justify-between h-full space-y-4">
              
              {/* Email details */}
              <div className="space-y-4">
                <div className={`flex items-start justify-between border-b pb-3 ${isDark ? 'border-slate-955' : 'border-slate-150'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-700'}`} />
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-950 font-black'}`}>
                        {selectedMail.type === 'email' ? 'Prof. Miller (CS401 Coordinator)' : 'Overdrive Autonomous Triage Bot'}
                      </h4>
                      <p className={`text-[9px] uppercase mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>
                        {selectedMail.type === 'email' ? 'To: student@university.edu' : 'To: workspace-broadcast'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>16:48 PM</span>
                </div>

                <div className="space-y-3">
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-950 font-black'}`}>
                    Subject: {selectedMail.title}
                  </h3>

                  {/* Body message from professor / system warning */}
                  <div className={`p-4 rounded-xl border text-[10px] leading-normal ${
                    isDark 
                      ? 'bg-slate-950/40 border-slate-955 text-slate-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-950 font-bold'
                  }`}>
                    {selectedMail.type === 'email' ? (
                      <div>
                        <strong>[System Warning Alert]</strong>: CS401 Submission due in 45 minutes (22:00 PM). Git repository history shows 0 recent commits. Presentation slide files not detected in drive sync root.
                      </div>
                    ) : selectedMail.type === 'notification' ? (
                      <div>
                        <strong>[Calendar Block Collision]</strong>: Focus Block is colliding with dinner group reservation from 19:00 - 21:00 PM. Restructuring communication loops.
                      </div>
                    ) : (
                      <div>
                        <strong>[System Pipeline Script]</strong>: Autonomous Triage mode engaged. Checklist resolution path running below.
                      </div>
                    )}
                  </div>

                  {/* Generated AI reply draft box */}
                  {(selectedMail.type === 'email' || selectedMail.type === 'notification') && (
                    <div className={`p-4 rounded-xl border relative ${
                      isDark ? 'bg-[#030712] border-slate-900' : 'bg-slate-50 border-slate-250 shadow-sm'
                    }`}>
                      <div className="absolute top-2.5 right-3 flex items-center space-x-1.5 text-[8px] bg-kinetic-cyan/15 text-kinetic-cyan px-2 py-0.5 rounded border border-kinetic-cyan/25 font-bold">
                        <CornerUpLeft className="w-3 h-3" />
                        <span>AI AUTO-DRAFT</span>
                      </div>
                      
                      <div className={`text-[10px] leading-relaxed mt-2 font-mono whitespace-pre-wrap ${
                        isDark ? 'text-slate-300' : 'text-slate-950 font-bold'
                      }`}>
                        {selectedMail.type === 'email' 
                          ? selectedMail.details.body 
                          : `Broadcast message:\n"${selectedMail.details.message}"`
                        }
                      </div>

                      {/* Control Panel inside draft box */}
                      <div className={`flex gap-3 mt-5 border-t pt-4 ${isDark ? 'border-slate-900' : 'border-slate-200'}`}>
                        <button
                          id={`btn-approve-card-${selectedMail.id}`}
                          onClick={() => onApproveCard(selectedMail.id)}
                          className="flex-1 flex items-center justify-center space-x-2 font-bold uppercase py-3 px-4 rounded-lg bg-cyber-emerald/10 border border-cyber-emerald/25 hover:bg-cyber-emerald/15 hover:border-cyber-emerald/50 text-cyber-emerald text-[9px] transition-all duration-200 active:scale-97"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>TRANSMIT RESPONSE</span>
                          {activeCards[0].id === selectedMail.id && (
                            <span className="opacity-45 text-[8px] font-normal ml-1 border border-cyber-emerald/30 px-1 rounded">Space</span>
                          )}
                        </button>
                        <button
                          id={`btn-abort-card-${selectedMail.id}`}
                          onClick={() => onAbortCard(selectedMail.id)}
                          className="flex-none flex items-center justify-center p-3 rounded-lg bg-overdrive-crimson/5 border border-overdrive-crimson/15 hover:bg-overdrive-crimson/10 hover:border-overdrive-crimson/40 text-overdrive-crimson transition-all duration-200 active:scale-97"
                          title="Abort Action"
                        >
                          <Ban className="w-4 h-4" />
                          {activeCards[0].id === selectedMail.id && (
                            <span className="text-[8px] font-normal font-mono ml-1 border border-overdrive-crimson/30 px-1 rounded">Esc</span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Task list display */}
                  {selectedMail.type === 'tasks' && selectedMail.details && (
                    <div className={`p-3.5 rounded-xl border divide-y ${
                      isDark ? 'bg-[#030712] border-slate-900 divide-slate-950' : 'bg-slate-50 border-slate-200 divide-slate-150'
                    }`}>
                      {selectedMail.details.tasks.map((task, tidx) => (
                        <div key={tidx} className="py-2.5 flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-2.5">
                            <span className={task.status === 'completed' ? 'text-cyber-emerald font-bold' : task.status === 'active' ? 'text-kinetic-cyan animate-pulse' : isDark ? 'text-slate-600' : 'text-slate-800 font-bold'}>
                              {task.status === 'completed' ? '■' : task.status === 'active' ? '▶' : '○'}
                            </span>
                            <span className={task.status === 'completed' ? 'line-through text-slate-500 font-normal' : isDark ? 'text-slate-300' : 'text-slate-950 font-bold'}>
                              {task.title}
                            </span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                            task.status === 'completed' ? 'bg-cyber-emerald/10 text-cyber-emerald' :
                            task.status === 'active' ? 'bg-kinetic-cyan/10 text-kinetic-cyan animate-pulse' :
                            isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className={`flex-grow flex flex-col justify-between p-5 rounded-xl text-[10px] min-h-[220px] ${
              isDark ? 'bg-slate-950/40 border border-slate-900 text-slate-550' : 'bg-slate-50 border border-slate-200 text-slate-950 font-bold'
            }`}>
              <div className={`flex items-center justify-between border-b pb-2.5 mb-3.5 ${
                isDark ? 'border-slate-900' : 'border-slate-200'
              }`}>
                <span className={`font-bold uppercase text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-900 font-black'}`}>
                  _ System Idle // Scanning background processes
                </span>
                <span className="text-cyber-emerald text-[8px] bg-cyber-emerald/10 border border-cyber-emerald/20 px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                  ACTIVE
                </span>
              </div>
              
              <div className="flex-1 space-y-2.5 max-h-[190px] overflow-y-auto">
                {ambientLogs.map((log) => (
                  <div key={log.id} className={`flex items-start justify-between border-b pb-1.5 last:border-0 last:pb-0 ${
                    isDark ? 'border-slate-955' : 'border-slate-100'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <span className={`${isDark ? 'text-slate-600' : 'text-slate-800 font-bold'} select-none`}>[{log.time}]</span>
                      <span className={isDark ? 'text-slate-350' : 'text-slate-900'}>{log.task}...</span>
                    </div>
                    <span className="text-cyber-emerald font-bold shrink-0">{log.status}</span>
                  </div>
                ))}
              </div>
              
              <div className={`border-t pt-3 mt-3 flex justify-between items-center text-[9px] ${
                isDark ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-800'
              }`}>
                <span>Threat Level: stable</span>
                <span>Guard: active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
