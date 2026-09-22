import React, { useState, useEffect } from 'react';
import { DailyCheckin, PeriodFlow } from '@/types/planner';
import {
  useDailyCheckinByDateQuery,
  useUpsertDailyCheckinMutation,
  useDeleteDailyCheckinMutation,
} from '@/hooks/useDailyCheckins';
import {
  X,
  Smile,
  Zap,
  FileText,
  Heart,
  Droplets,
  Trash2,
  Check,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyCheckinPopoverProps {
  dateStr: string; // YYYY-MM-DD
  isOpen: boolean;
  onClose: () => void;
  onCheckinSaved?: (savedCheckin: DailyCheckin) => void;
}

const MOOD_PRESETS = [
  { emoji: '😄', label: 'Vui vẻ / Phấn chấn', color: 'hover:bg-amber-500/15 border-amber-500/30 text-amber-500' },
  { emoji: '😊', label: 'Ổn định / Bình thường', color: 'hover:bg-emerald-500/15 border-emerald-500/30 text-emerald-500' },
  { emoji: '🧘', label: 'Bình yên / Thư thái', color: 'hover:bg-teal-500/15 border-teal-500/30 text-teal-500' },
  { emoji: '🔥', label: 'Tràn đầy năng lượng', color: 'hover:bg-orange-500/15 border-orange-500/30 text-orange-500' },
  { emoji: '🥱', label: 'Mệt mỏi / Uể oải', color: 'hover:bg-indigo-500/15 border-indigo-500/30 text-indigo-400' },
  { emoji: '😣', label: 'Kiệt sức / Căng thẳng', color: 'hover:bg-rose-500/15 border-rose-500/30 text-rose-500' },
  { emoji: '🌧️', label: 'Trầm lắng / Buồn', color: 'hover:bg-blue-500/15 border-blue-500/30 text-blue-400' },
];

const FLOW_OPTIONS: { value: PeriodFlow; label: string; desc: string }[] = [
  { value: 'SPOTTING', label: 'Đốm nhẹ', desc: 'Rất ít' },
  { value: 'LIGHT', label: 'Nhẹ', desc: 'Lượng ít' },
  { value: 'MEDIUM', label: 'Vừa', desc: 'Trung bình' },
  { value: 'HEAVY', label: 'Nhiều', desc: 'Lượng nhiều / Cần nghỉ' },
];

function formatDateDisplay(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export const DailyCheckinPopover: React.FC<DailyCheckinPopoverProps> = ({
  dateStr,
  isOpen,
  onClose,
  onCheckinSaved,
}) => {
  const { data: existingCheckin, isLoading } = useDailyCheckinByDateQuery(dateStr);
  const upsertMutation = useUpsertDailyCheckinMutation();
  const deleteMutation = useDeleteDailyCheckinMutation();

  const [selectedEmoji, setSelectedEmoji] = useState<string>('😊');
  const [selectedMoodLabel, setSelectedMoodLabel] = useState<string>('Ổn định / Bình thường');
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [note, setNote] = useState<string>('');
  const [isPeriodDay, setIsPeriodDay] = useState<boolean>(false);
  const [flowIntensity, setFlowIntensity] = useState<PeriodFlow>('NONE');

  useEffect(() => {
    if (existingCheckin) {
      setSelectedEmoji(existingCheckin.moodEmoji || '😊');
      setSelectedMoodLabel(existingCheckin.moodLabel || 'Ổn định / Bình thường');
      setEnergyLevel(existingCheckin.energyLevel || 3);
      setNote(existingCheckin.note || '');
      setIsPeriodDay(Boolean(existingCheckin.isPeriodDay));
      setFlowIntensity(existingCheckin.flowIntensity || 'NONE');
    } else {
      setSelectedEmoji('😊');
      setSelectedMoodLabel('Ổn định / Bình thường');
      setEnergyLevel(3);
      setNote('');
      setIsPeriodDay(false);
      setFlowIntensity('NONE');
    }
  }, [existingCheckin, dateStr, isOpen]);

  if (!isOpen) return null;

  const handleSelectMood = (emoji: string, label: string) => {
    setSelectedEmoji(emoji);
    setSelectedMoodLabel(label);
  };

  const handleTogglePeriod = () => {
    const nextState = !isPeriodDay;
    setIsPeriodDay(nextState);
    if (nextState && flowIntensity === 'NONE') {
      setFlowIntensity('MEDIUM');
    } else if (!nextState) {
      setFlowIntensity('NONE');
    }
  };

  const handleSave = async () => {
    const payload: DailyCheckin = {
      checkinDate: dateStr,
      moodEmoji: selectedEmoji,
      moodLabel: selectedMoodLabel,
      energyLevel,
      note: note.trim() || undefined,
      isPeriodDay,
      flowIntensity: isPeriodDay ? flowIntensity : 'NONE',
    };

    try {
      const saved = await upsertMutation.mutateAsync(payload);
      if (onCheckinSaved) {
        onCheckinSaved(saved);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save daily check-in:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dateStr);
      onClose();
    } catch (err) {
      console.error('Failed to delete daily check-in:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shadow-inner">
              {selectedEmoji}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base sm:text-lg flex items-center gap-2">
                Daily Check-in & Nhật ký
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border border-primary/20">
                  {formatDateDisplay(dateStr)}
                </span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Ghi nhận cảm xúc, mức năng lượng và sức khỏe trong ngày
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: Mood Emoji Selector */}
          <div>
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Smile className="w-4 h-4 text-primary" /> Tâm trạng hôm nay
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {MOOD_PRESETS.map((m) => {
                const isSelected = selectedEmoji === m.emoji;
                return (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => handleSelectMood(m.emoji, m.label)}
                    title={m.label}
                    className={`h-12 rounded-xl flex flex-col items-center justify-center border transition-all text-xl group relative ${
                      isSelected
                        ? 'bg-primary/15 border-primary shadow-sm ring-2 ring-primary/30 scale-105'
                        : 'bg-muted/30 border-border/50 hover:bg-muted/60 hover:scale-105'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px]">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-1.5 font-medium italic">
              Đang chọn: <span className="text-foreground font-semibold">{selectedMoodLabel}</span>
            </p>
          </div>

          {/* Section 2: Energy Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Mức năng lượng & Thể trạng
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                energyLevel <= 2
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
                  : energyLevel === 3
                  ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
              }`}>
                {energyLevel === 1 && '1/5 · Kiệt sức 😣'}
                {energyLevel === 2 && '2/5 · Mệt mỏi 🥱'}
                {energyLevel === 3 && '3/5 · Vừa phải 😊'}
                {energyLevel === 4 && '4/5 · Tràn đầy năng lượng 🔥'}
                {energyLevel === 5 && '5/5 · Đỉnh cao / Sẵn sàng mọi thứ 🚀'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergyLevel(lvl)}
                  className={`flex-1 h-9 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1 ${
                    energyLevel === lvl
                      ? lvl <= 2
                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-400/30'
                        : lvl === 3
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-emerald-500 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/30'
                      : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Period Tracking */}
          <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.04] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 text-sm">
                  🩸
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    Đánh dấu chu kỳ kinh nguyệt
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Theo dõi chu kỳ & hỗ trợ AI điều chỉnh lịch phù hợp
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTogglePeriod}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isPeriodDay ? 'bg-rose-500' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                    isPeriodDay ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {isPeriodDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2 border-t border-rose-500/15 space-y-2"
              >
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Lượng kinh nguyệt (Flow):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FLOW_OPTIONS.map((f) => {
                    const isSelected = flowIntensity === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFlowIntensity(f.value)}
                        className={`p-2 rounded-lg border text-left flex flex-col transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                            : 'bg-background/80 border-rose-500/20 text-foreground hover:bg-rose-500/10'
                        }`}
                      >
                        <span className="text-xs font-bold">{f.label}</span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {f.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Section 4: Daily Note */}
          <div>
            <label className="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FileText className="w-4 h-4 text-primary" /> Ghi chú & Cảm nghĩ ngày
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi nhanh cảm xúc, sự kiện đáng nhớ hoặc lưu ý sức khỏe..."
              rows={3}
              maxLength={500}
              className="w-full p-3 rounded-xl bg-background border border-border/80 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none transition-all"
            />
            <div className="text-right text-[10px] text-muted-foreground mt-0.5">
              {note.length}/500 ký tự
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          {existingCheckin ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-3.5 py-2 rounded-xl border border-rose-500/30 text-rose-600 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa check-in
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={upsertMutation.isPending}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {upsertMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Lưu Check-in
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
