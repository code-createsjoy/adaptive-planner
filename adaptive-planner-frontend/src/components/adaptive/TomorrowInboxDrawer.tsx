import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Sparkles, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  SunMedium,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { TimeBlock, CalmSlot } from '@/types/planner';
import { api } from '@/lib/api';

interface TomorrowInboxDrawerProps {
  selectedDate: string;
  inboxBlocks: TimeBlock[];
  onScheduled: (block: TimeBlock) => void;
  onRefresh: () => void;
}

export const TomorrowInboxDrawer: React.FC<TomorrowInboxDrawerProps> = ({
  selectedDate,
  inboxBlocks,
  onScheduled,
  onRefresh,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TimeBlock | null>(null);
  const [calmSlots, setCalmSlots] = useState<CalmSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  if (inboxBlocks.length === 0) {
    return null;
  }

  const handleOpenSlotFinder = async (task: TimeBlock) => {
    setSelectedTask(task);
    setIsLoadingSlots(true);
    try {
      const dur = task.durationMinutes || 60;
      const slots = await api.getCalmOpenings(
        task.inboxDate || selectedDate,
        dur,
        task.category || 'work',
        task.energyLevel || 'medium'
      );
      setCalmSlots(slots);
    } catch (e) {
      console.error('Failed to load calm slots', e);
      // Fallback slots
      setCalmSlots([
        {
          startTime: '10:00',
          endTime: '11:00',
          durationMinutes: 60,
          calmScore: 0.95,
          reason: 'Khoảng trống sáng thông thoáng, cách xa giờ ăn trưa',
          isRecommended: true,
        },
        {
          startTime: '14:00',
          endTime: '15:00',
          durationMinutes: 60,
          calmScore: 0.85,
          reason: 'Khoảng nghỉ êm ả buổi chiều',
          isRecommended: false,
        }
      ]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleApplySlot = async (task: TimeBlock, slot: CalmSlot) => {
    setSchedulingId(task.id);
    try {
      const updated = await api.scheduleFromInbox(
        task.id,
        slot.startTime,
        slot.endTime,
        task.inboxDate || selectedDate
      );
      onScheduled(updated);
      setSelectedTask(null);
      setCalmSlots([]);
      onRefresh();
    } catch (e) {
      console.error('Failed to schedule from inbox', e);
    } finally {
      setSchedulingId(null);
    }
  };

  return (
    <div className="w-full mb-6">
      {/* Collapsible Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/20 to-slate-900/60 backdrop-blur-xl p-4 shadow-xl shadow-amber-950/10 cursor-pointer transition-all hover:border-amber-500/50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm sm:text-base">
                  Tomorrow Inbox
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {inboxBlocks.length} việc hoãn lại
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white border border-slate-700/50"
            >
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Expanded Content Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3 space-y-3"
          >
            {inboxBlocks.map((block) => (
              <div
                key={block.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white text-sm">
                      {block.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/40">
                      {block.category || 'work'}
                    </span>
                    {block.deadline && (
                      <span className="text-xs px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/40">
                        Deadline: {block.deadline}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {block.detail || 'Chưa xếp giờ cố định · Sẵn sàng xếp vào Calm Opening.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSlotFinder(block);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-600/80 to-emerald-600/80 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-semibold shadow-lg shadow-teal-950/30 border border-teal-400/30 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✦ Tìm Calm Opening</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Calm Slots Selector Modal / Overlay */}
            {selectedTask && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-slate-950/90 border border-teal-500/30 shadow-2xl space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Gợi ý Calm Opening cho: {selectedTask.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    ✕ Đóng
                  </button>
                </div>

                {isLoadingSlots ? (
                  <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin text-teal-400" />
                    <span>Đang tìm khoảng trống êm ả không gây quá tải...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {calmSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                          slot.isRecommended
                            ? 'bg-gradient-to-br from-teal-950/60 to-slate-900 border-teal-500/50 shadow-lg shadow-teal-950/20'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-sm flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-teal-400" />
                              {slot.startTime} – {slot.endTime}
                            </span>
                            {slot.isRecommended && (
                              <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/40">
                                ✦ Tốt nhất
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            {slot.reason}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={schedulingId === selectedTask.id}
                          onClick={() => handleApplySlot(selectedTask, slot)}
                          className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            slot.isRecommended
                              ? 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
                              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                          }`}
                        >
                          {schedulingId === selectedTask.id ? (
                            <span>Đang xếp...</span>
                          ) : (
                            <>
                              <span>Xếp vào lịch {slot.startTime}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
