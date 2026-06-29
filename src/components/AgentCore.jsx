import React, { useEffect, useRef, useState } from 'react';
import { Shield, ShieldAlert, Cpu, Activity, AlertTriangle } from 'lucide-react';
import { playKeystroke, playAlert } from '../utils/audio';

export default function AgentCore({ state, onTriggerCrisis, thoughtLog, advancedMode, theme = 'dark' }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [displayedThought, setDisplayedThought] = useState("");

  const isDark = theme === 'dark';

  // Typewriter effect for thoughts
  useEffect(() => {
    if (!thoughtLog || thoughtLog.length === 0) return;
    
    let currentThought = thoughtLog[thoughtLog.length - 1];
    let charIdx = 0;
    setDisplayedThought("");
    
    const interval = setInterval(() => {
      if (charIdx <= currentThought.length) {
        setDisplayedThought(currentThought.substring(0, charIdx));
        charIdx++;
        if (Math.random() > 0.45) {
          playKeystroke();
        }
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [state, thoughtLog]);

  // Canvas Orb Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    resizeCanvas();

    const render = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      let color1, color2, speed, amp, linesCount, baseRadius;

      switch (state) {
        case 'critical':
          color1 = 'rgba(239, 68, 68, 0.85)'; // Crimson
          color2 = 'rgba(245, 158, 11, 0.4)';  // Amber
          speed = 0.08;
          amp = 20;
          linesCount = 3;
          baseRadius = Math.min(width, height) * 0.28;
          break;
        case 'thinking':
          color1 = isDark ? 'rgba(6, 182, 212, 0.9)' : 'rgba(8, 145, 178, 0.9)';  // Cyan
          color2 = 'rgba(16, 185, 129, 0.3)'; // Emerald
          speed = 0.05;
          amp = 12;
          linesCount = 4;
          baseRadius = Math.min(width, height) * 0.25;
          break;
        case 'mitigated':
          color1 = 'rgba(16, 185, 129, 0.85)'; // Cyber Emerald
          color2 = 'rgba(6, 182, 212, 0.2)';   // Cyan
          speed = 0.012;
          amp = 3;
          linesCount = 2;
          baseRadius = Math.min(width, height) * 0.24;
          break;
        case 'idle':
        default:
          color1 = isDark ? 'rgba(6, 182, 212, 0.45)' : 'rgba(8, 145, 178, 0.55)';  // Muted Cyan
          color2 = isDark ? 'rgba(15, 23, 42, 0.1)' : 'rgba(203, 213, 225, 0.2)';
          speed = 0.008;
          amp = 6;
          linesCount = 2;
          baseRadius = Math.min(width, height) * 0.22;
          break;
      }

      angle += speed;

      // Draw radial background glow
      const glowGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius * 2);
      glowGrad.addColorStop(0, state === 'critical' ? 'rgba(239, 68, 68, 0.05)' : state === 'mitigated' ? 'rgba(16, 185, 129, 0.03)' : 'rgba(6, 182, 212, 0.02)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Render pulsating rings
      for (let j = 0; j < linesCount; j++) {
        ctx.beginPath();
        const ringOffset = j * (Math.PI / linesCount) * 1.5;
        const currentRadius = baseRadius - (j * 6);

        for (let i = 0; i <= 360; i += 2) {
          const radian = (i * Math.PI) / 180;
          const sineNoise = Math.sin(radian * 8 + angle + ringOffset) * Math.cos(radian * 3 - angle * 0.7);
          const throb = currentRadius + sineNoise * amp;

          const x = centerX + Math.cos(radian) * throb;
          const y = centerY + Math.sin(radian) * throb;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.strokeStyle = color1;
        ctx.lineWidth = j === 0 ? 2 : 1;
        ctx.stroke();
      }

      // Centerpiece Dot indicator
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = color1;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [state, theme]);

  return (
    <div ref={containerRef} className={`flex flex-col h-full justify-between p-8 relative overflow-hidden border rounded-2xl transition-colors duration-150 ${
      isDark ? 'bg-[#090d16] border-slate-800/80 text-slate-350' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      
      {/* Top Header Row of Orb Center */}
      <div className={`w-full flex items-center justify-between border-b pb-4 mb-4 ${isDark ? 'border-slate-800/40' : 'border-slate-100'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${
            state === 'critical' ? 'bg-overdrive-crimson animate-ping' : 
            state === 'thinking' ? 'bg-kinetic-cyan animate-pulse' : 
            state === 'mitigated' ? 'bg-cyber-emerald' : 'bg-slate-500'
          }`} />
          <span className={`text-[10px] font-mono uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-900 font-black'}`}>
            SYSTEM STATUS // {state}
          </span>
        </div>

        {/* Collapsible advanced indicator */}
        {advancedMode && (
          <div className={`flex items-center space-x-1.5 font-mono text-xs py-1 px-2.5 rounded border view-fade-in ${
            isDark ? 'text-slate-500 bg-slate-950/40 border-slate-800/60' : 'text-slate-955 bg-slate-50 border-slate-200 font-bold'
          }`}>
            <Activity className={`w-3.5 h-3.5 mr-1 ${state === 'critical' ? 'text-overdrive-crimson animate-pulse-fast' : 'text-slate-655'}`} />
            <span>CORE: ACTIVE</span>
          </div>
        )}
      </div>

      {/* Orbit Visualization Canvas */}
      <div className="relative w-full flex-grow flex items-center justify-center min-h-[220px] max-h-[300px] my-4">
        <canvas 
          ref={canvasRef} 
          onClick={() => {
            if (state === 'idle') {
              playAlert();
              onTriggerCrisis();
            }
          }}
          title={state === 'idle' ? "Click core to simulate deadline incident" : undefined}
          className={`absolute inset-0 block mx-auto animate-pulse-slow ${state === 'idle' ? 'cursor-pointer' : ''}`} 
        />
        
        {/* Absolute Center Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center select-none pointer-events-none">
          {state === 'critical' ? (
            <ShieldAlert className="w-9 h-9 text-overdrive-crimson animate-bounce" />
          ) : (
            <Shield className={`w-9 h-9 ${state === 'mitigated' ? 'text-cyber-emerald' : 'text-kinetic-cyan/85'}`} />
          )}
          <span className={`text-xs font-mono tracking-widest uppercase mt-2.5 ${
            state === 'critical' ? 'text-overdrive-crimson font-black' : isDark ? 'text-slate-400' : 'text-slate-950 font-black'
          }`}>
            {state === 'critical' ? 'CRITICAL INSTABILITY' : state === 'mitigated' ? 'REALIGNMENT COMPLETE' : 'CORE INGEST ACTIVE'}
          </span>
        </div>
      </div>

      {/* Ticker & AI Thoughts Block */}
      <div className={`w-full p-5 rounded-xl border font-mono min-h-[110px] flex flex-col justify-between ${
        isDark ? 'bg-[#030712] border-slate-800/60' : 'bg-slate-50 border-slate-200 shadow-sm'
      }`}>
        <div className={`text-sm leading-relaxed ${isDark ? 'text-slate-355' : 'text-slate-950 font-bold'}`}>
          <span className="text-kinetic-cyan select-none mr-2.5 font-bold">&gt;</span>
          {(() => {
            const colonIndex = displayedThought.indexOf(':');
            if (colonIndex !== -1) {
              const header = displayedThought.substring(0, colonIndex);
              const body = displayedThought.substring(colonIndex + 1);
              return (
                <>
                  <span className="text-kinetic-cyan font-bold uppercase mr-1.5">{header}:</span>
                  <span>{body}</span>
                </>
              );
            }
            return <span>{displayedThought}</span>;
          })()}
          <span className="animate-pulse font-bold text-kinetic-cyan">_</span>
        </div>
        
        {advancedMode && (
          <div className={`flex items-center justify-between text-[10px] text-slate-500 border-t mt-4 pt-2 view-fade-in ${
            isDark ? 'border-slate-900' : 'border-slate-200'
          }`}>
            <span>ENGINE: OVERDRIVE_CORE_V1.1</span>
            <span className={isDark ? 'text-slate-500' : 'text-slate-900 font-bold'}>SYSTEM STABILITY: {state === 'critical' ? '54.2%' : state === 'mitigated' ? '99.8%' : '98.5%'}</span>
          </div>
        )}
      </div>

      {/* Active Guard Status Panel */}
      <div className={`w-full mt-6 p-4 rounded-xl border font-mono text-sm space-y-2.5 ${
        isDark ? 'bg-[#030712]/50 border-slate-800/40' : 'bg-slate-55 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`uppercase tracking-wider text-xs ${isDark ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>Shield Status:</span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${state === 'critical' ? 'bg-overdrive-crimson animate-ping' : 'bg-cyber-emerald animate-pulse'}`} />
            <span className={`font-bold ${state === 'critical' ? 'text-overdrive-crimson' : 'text-cyber-emerald'}`}>
              {state === 'critical' ? 'INTERCEPT ACTIVE' : 'SECURE'}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between border-t pt-2.5 ${isDark ? 'border-slate-900' : 'border-slate-200'}`}>
          <span className={`uppercase tracking-wider text-xs ${isDark ? 'text-slate-500' : 'text-slate-900 font-bold'}`}>Next Monitored Target:</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-950 font-black'}>CS401 Submission</span>
        </div>
        <div className={`flex items-center justify-between border-t pt-2.5 text-xs ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-900 font-bold'
        }`}>
          <span>Target Deadline:</span>
          <span className={isDark ? 'font-bold text-slate-400' : 'font-bold text-slate-950'}>22:00 PM (Tonight)</span>
        </div>
      </div>

      {/* Upscaled Connected Services Network Panel */}
      <div className={`w-full mt-4 p-4 rounded-xl border font-mono text-[10px] space-y-2.5 ${
        isDark ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-100/35 border-slate-200'
      }`}>
        <div className={`flex items-center justify-between border-b pb-2 mb-2 ${
          isDark ? 'border-slate-900 text-slate-400' : 'border-slate-200 text-slate-950 font-black'
        }`}>
          <span className="font-bold uppercase tracking-wider text-[9px]">Connected Services Network</span>
          <span className="text-[8px] bg-cyber-emerald/10 border border-cyber-emerald/25 text-cyber-emerald px-1.5 py-0.2 rounded font-extrabold">ACTIVE</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>Gemini Pro API</span>
            <span className="text-cyber-emerald font-bold">15 RPM</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>Mail Agent</span>
            <span className="text-cyber-emerald font-bold">READY</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>Calendar Link</span>
            <span className="text-cyber-emerald font-bold">CONNECTED</span>
          </div>
          <div className={`flex flex-col border-t pt-1.5 ${isDark ? 'border-slate-900/40' : 'border-slate-200'}`}>
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>Canvas LMS</span>
            <span className="text-cyber-emerald font-bold">MONITORING</span>
          </div>
          <div className={`flex flex-col border-t pt-1.5 ${isDark ? 'border-slate-900/40' : 'border-slate-200'}`}>
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>Slack Webhook</span>
            <span className="text-cyber-emerald font-bold">VERIFIED</span>
          </div>
          <div className={`flex flex-col border-t pt-1.5 ${isDark ? 'border-slate-900/40' : 'border-slate-200'}`}>
            <span className={`text-[8px] uppercase ${isDark ? 'text-slate-500' : 'text-slate-800 font-bold'}`}>System Daemon</span>
            <span className="text-cyber-emerald font-bold">LISTENING</span>
          </div>
        </div>
      </div>
    </div>
  );
}
