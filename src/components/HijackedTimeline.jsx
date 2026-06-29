import React, { useState } from 'react';
import { 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  Calendar as CalendarIcon 
} from 'lucide-react';

export default function HijackedTimeline({ 
  state, 
  advancedMode, 
  theme = 'dark', 
  searchQuery = '', 
  calendarEvents = [], 
  onRescheduleEvent 
}) {
  const isCrisis = state !== 'idle';
  const isDark = theme === 'dark';
  const [selectedConflictId, setSelectedConflictId] = useState(null);

  // Hours array for Calendar timeline grid
  const hours = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  // Filter calendar events by search query
  const filteredEvents = calendarEvents.filter(event => {
    const titleMatch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const actionMatch = event.action.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || actionMatch;
  });

  return (
    <div className={`flex-grow flex flex-col border rounded-2xl p-6 font-mono h-full transition-colors duration-150 ${
      isDark ? 'bg-[#090d16] border-slate-800/80 text-slate-350' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      
      {/* Calendar Header */}
      <div className={`flex items-center justify-between border-b pb-4 mb-5 z-10 ${
        isDark ? 'border-slate-900' : 'border-slate-100'
      }`}>
        <div className="flex items-center space-x-3 text-slate-400">
          <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-kinetic-cyan' : 'text-cyan-600'}`} />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-950 font-black'}`}>
            Calendar Hijack (Day Grid)
          </span>
        </div>
        
        <div className={`flex items-center space-x-2 text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>
          <span>SATURDAY, JUNE 27</span>
          <span className="text-slate-700">|</span>
          <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${
            isCrisis && state !== 'mitigated' 
              ? 'bg-overdrive-crimson/10 border-overdrive-crimson/25 text-overdrive-crimson animate-pulse'
              : 'bg-cyber-emerald/10 border-cyber-emerald/25 text-cyber-emerald'
          }`}>
            {isCrisis && state !== 'mitigated' ? 'SHIELD ENGAGED' : 'SECURE'}
          </span>
        </div>
      </div>

      {/* Calendar Grid Viewport */}
      <div className="flex-grow overflow-y-auto pr-1 max-h-[500px] lg:max-h-[none] relative min-h-[380px]">
        <div className={`relative border-l ml-[60px] pl-4 space-y-8 py-2 ${
          isDark ? 'border-slate-900' : 'border-slate-200'
        }`}>
          
          {/* Time axis on the absolute left */}
          <div className={`absolute left-[-60px] top-0 bottom-0 w-[50px] flex flex-col justify-between py-2 text-[9px] font-bold select-none text-right pr-2 ${
            isDark ? 'text-slate-600' : 'text-slate-955'
          }`}>
            {hours.map(hour => (
              <div key={hour} className="h-6 flex items-center justify-end font-black">
                {hour}
              </div>
            ))}
          </div>

          {/* Calendar Events List */}
          {filteredEvents.length === 0 ? (
            <div className={`text-center py-12 text-xs italic ${isDark ? 'text-slate-600' : 'text-slate-850 font-bold'}`}>
              No schedule events found matching "{searchQuery}"
            </div>
          ) : (
            filteredEvents.map((event, index) => {
              const isMuted = event.isMuted;
              const isConflict = event.isConflict;
              const isLockdown = event.isLockdown;
              const isCrisisZone = event.isCrisisZone;
              const isDeadline = event.isDeadline;

              return (
                <div 
                  key={event.id || index} 
                  onClick={() => {
                    if (isConflict && state !== 'idle') {
                      setSelectedConflictId(selectedConflictId === event.id ? null : event.id);
                    }
                  }}
                  className={`relative flex flex-col transition-all duration-300 ${
                    isMuted && !isConflict ? 'opacity-35 scale-[0.98]' : 'opacity-100 scale-100'
                  } ${isConflict && state !== 'idle' ? 'cursor-pointer' : ''}`}
                >
                  {/* Timeline Dot Indicator */}
                  <div className={`absolute left-[-21px] top-4 w-2.5 h-2.5 rounded-full border border-slate-950 z-20 transition-all duration-300 ${
                    isMuted && !isConflict ? 'bg-slate-800' :
                    isCrisisZone ? 'bg-overdrive-crimson animate-ping' :
                    isLockdown ? 'bg-kinetic-cyan' :
                    isDeadline ? (state === 'mitigated' ? 'bg-cyber-emerald' : 'bg-overdrive-crimson animate-pulse') : 'bg-slate-700'
                  }`} />

                  {/* Event Card Panel */}
                  <div className={`p-4 rounded-xl border transition-all duration-200 ${
                    isMuted && !isConflict 
                      ? isDark 
                        ? 'bg-slate-950/20 border-slate-900 text-slate-600' 
                        : 'bg-slate-50/50 border-slate-200 text-slate-900 font-bold line-through opacity-70 shadow-sm'
                      : isConflict 
                        ? isDark
                          ? 'bg-overdrive-amber/5 border-overdrive-amber/20 text-overdrive-amber line-through opacity-55 hover:border-overdrive-amber/55' 
                          : 'bg-amber-50/30 border-overdrive-amber/25 text-overdrive-amber line-through opacity-85 shadow-sm hover:border-overdrive-amber/60'
                        : isCrisisZone 
                          ? isDark
                            ? 'glass-panel-crimson border-overdrive-crimson/30 text-overdrive-crimson font-bold' 
                            : 'bg-red-50/60 border-overdrive-crimson/25 text-overdrive-crimson font-black shadow-sm'
                          : isLockdown 
                            ? isDark
                              ? 'glass-panel-cyan border-kinetic-cyan/35 text-kinetic-cyan' 
                              : 'bg-cyan-50/40 border-kinetic-cyan/30 text-kinetic-cyan shadow-sm'
                            : isDeadline 
                              ? isDark
                                ? (state === 'mitigated' ? 'bg-cyber-emerald/5 border-cyber-emerald/20 text-slate-200' : 'glass-panel-crimson border-overdrive-crimson/45 text-slate-200') 
                                : (state === 'mitigated' ? 'bg-emerald-50/50 border-cyber-emerald/35 text-slate-955 shadow-sm' : 'bg-red-50/50 border-overdrive-crimson/35 text-slate-955 shadow-sm')
                              : isDark
                                ? 'bg-slate-900/40 border-slate-800 text-slate-300' 
                                : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm font-semibold'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold ${isDark ? 'opacity-75' : 'text-slate-850 font-black'}`}>{event.time}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border font-extrabold uppercase ${
                        isMuted && !isConflict ? 'bg-slate-900 border-slate-800 text-slate-500' :
                        isConflict ? 'bg-overdrive-amber/10 border-overdrive-amber/20 text-overdrive-amber' :
                        isCrisisZone ? 'bg-overdrive-crimson/10 border-overdrive-crimson/20 text-overdrive-crimson' :
                        isLockdown ? 'bg-kinetic-cyan/15 border-kinetic-cyan/25 text-kinetic-cyan' :
                        isDeadline ? (state === 'mitigated' ? 'bg-cyber-emerald/15 border-cyber-emerald/25 text-cyber-emerald' : 'bg-overdrive-crimson/15 border-overdrive-crimson/25 text-overdrive-crimson') :
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-200 border-slate-300 text-slate-800'
                      }`}>
                        {state === 'mitigated' && isDeadline ? 'MITIGATED' : event.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mt-2">
                      {isLockdown && <Lock className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-kinetic-cyan' : 'text-cyan-600'}`} />}
                      {isCrisisZone && <AlertCircle className="w-4 h-4 text-overdrive-crimson shrink-0 mt-0.5" />}
                      {state === 'mitigated' && isDeadline && <CheckCircle2 className="w-4 h-4 text-cyber-emerald shrink-0 mt-0.5" />}
                      
                      <h4 className={`text-xs font-bold leading-normal ${
                        isMuted && !isConflict ? 'line-through text-slate-505' : isDark ? 'text-slate-200' : 'text-slate-950 font-black'
                      }`}>
                        {event.title}
                      </h4>
                    </div>

                    {/* Actions / Intervention Descriptions */}
                    <p className={`text-[9px] mt-2 pl-1 font-mono flex items-center gap-1.5 leading-normal ${
                      isMuted && !isConflict ? 'text-slate-500' :
                      isConflict ? 'text-overdrive-amber/90 font-bold' :
                      isCrisisZone ? 'text-overdrive-amber/95 font-black' :
                      isLockdown ? isDark ? 'text-cyan-200/90' : 'text-cyan-900 font-bold' :
                      state === 'mitigated' && isDeadline ? 'text-cyber-emerald/95 font-bold' : isDark ? 'text-slate-400' : 'text-slate-900 font-black'
                    }`}>
                      {isMuted && !isConflict ? (
                        <span>⚙️ {event.action}</span>
                      ) : isLockdown ? (
                        <span className="flex items-center gap-1"><Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-kinetic-cyan' : 'text-cyan-600'}`} /> {event.action}</span>
                      ) : (
                        <span>⚡ {event.action}</span>
                      )}
                    </p>

                    {/* Reschedule Interactive Triage Sub-Block */}
                    {isConflict && selectedConflictId === event.id && state !== 'idle' && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className={`mt-3 p-3.5 rounded-lg border text-[10px] space-y-2.5 transition-all duration-150 ${
                          isDark ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200 shadow'
                        }`}
                      >
                        <p className={isDark ? 'text-slate-400' : 'text-slate-950 font-bold'}>
                          ⚠️ Realignment Override: This meeting collides with active Deep Work lockdown.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onRescheduleEvent(event.id);
                              setSelectedConflictId(null);
                            }}
                            className="flex-1 py-2 px-3 rounded bg-cyber-emerald/10 hover:bg-cyber-emerald/20 border border-cyber-emerald/30 text-cyber-emerald font-bold text-[9px] transition-colors active:scale-97"
                          >
                            Auto-Reschedule (AI)
                          </button>
                          <button
                            onClick={() => setSelectedConflictId(null)}
                            className={`py-2 px-3 rounded border text-[9px] transition-colors active:scale-97 ${
                              isDark ? 'border-slate-800 text-slate-500 hover:text-slate-350' : 'border-slate-200 text-slate-800 hover:text-slate-950 hover:bg-slate-50'
                            }`}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info: AI Override Status */}
      {isCrisis && advancedMode && (
        <div className={`mt-5 pt-4 border-t z-10 view-fade-in text-[9px] font-mono flex justify-between items-center ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-900 font-bold'
        }`}>
          <span className="uppercase">Calendar Status: Override Active</span>
          <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-kinetic-cyan' : 'text-cyan-705'}`}>Sync: Complete</span>
        </div>
      )}
    </div>
  );
}
