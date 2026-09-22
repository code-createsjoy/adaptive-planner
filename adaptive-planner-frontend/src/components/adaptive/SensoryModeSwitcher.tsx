import React from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { SensoryMode } from '@/types/planner';
import { Sparkles, Moon, Compass, Target, Info } from 'lucide-react';
import { motion } from 'framer-motion';

// Sensory Sound Feedback (Sine wave harmonic tone based on mode)
function playModeChime(mode: SensoryMode) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (mode === 'calm') {
      // 432 Hz soothing warm tone
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(324, ctx.currentTime + 0.3);
    } else if (mode === 'focus') {
      // 528 Hz transformation/clarity tone
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
    } else {
      // 480 Hz crisp balanced chord
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.25);
    }

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Audio context may be blocked by browser policy before first interaction
  }
}

export const SensoryModeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const currentMode = useAccessibilityStore((state) => state.currentMode);
  const setMode = useAccessibilityStore((state) => state.setMode);
  const resolvedConfig = useAccessibilityStore((state) => state.resolvedConfig);

  const modes: {
    id: SensoryMode;
    label: string;
    icon: React.ReactNode;
    shortDesc: string;
    colorClass: string;
    activeBg: string;
  }[] = [
    {
      id: 'calm',
      label: 'Calm',
      icon: <Moon className="w-3.5 h-3.5" />,
      shortDesc: 'Giảm tải thị giác • Now + Next task • Êm dịu',
      colorClass: 'text-teal-600 dark:text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-700 dark:text-teal-300 shadow-sm',
    },
    {
      id: 'balanced',
      label: 'Balanced',
      icon: <Compass className="w-3.5 h-3.5" />,
      shortDesc: 'Hồ sơ mặc định • Trải nghiệm cân bằng',
      colorClass: 'text-primary',
      activeBg: 'bg-primary/15 border-primary/40 text-primary shadow-sm',
    },
    {
      id: 'focus',
      label: 'Focus',
      icon: <Target className="w-3.5 h-3.5" />,
      shortDesc: '1 việc duy nhất • Ẩn xao nhãng • Bộ đếm tập trung',
      colorClass: 'text-amber-600 dark:text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300 shadow-sm',
    },
  ];

  const handleSelect = (mode: SensoryMode) => {
    if (mode === currentMode) return;
    setMode(mode);
    if (resolvedConfig.reminderChime !== 'none') {
      playModeChime(mode);
    }
  };

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="relative inline-flex items-center p-1 rounded-2xl bg-muted/60 border border-border/70 backdrop-blur-md shadow-xs">
        {modes.map((m) => {
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelect(m.id)}
              title={m.shortDesc}
              className={`relative px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? m.activeBg
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sensory-pill-active"
                  className="absolute inset-0 rounded-xl bg-background shadow-xs border border-border/60 -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                />
              )}
              <span className={isActive ? m.colorClass : 'text-muted-foreground'}>
                {m.icon}
              </span>
              <span className="hidden sm:inline font-bold">{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
