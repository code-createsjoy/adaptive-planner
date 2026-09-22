import React, { useState } from 'react';
import { TimeBlock, QuickRebalanceOption } from '@/types/planner';
import { useQuickRebalanceOptionsQuery } from '@/hooks/useCognitiveLoad';
import {
  Sparkles,
  Coffee,
  ArrowRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Check,
  X,
  MessageCircleQuestion,
  RefreshCw,
  Flame,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickRebalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  currentBlocks: TimeBlock[];
  onApplyProposal: (proposedBlocks: TimeBlock[], scenarioTitle: string) => void;
  onOpenAIChatWithPrompt: (prompt: string) => void;
}

export const QuickRebalanceModal: React.FC<QuickRebalanceModalProps> = ({
  isOpen,
  onClose,
  date,
  currentBlocks,
  onApplyProposal,
  onOpenAIChatWithPrompt,
}) => {
  const { data: proposal, isLoading } = useQuickRebalanceOptionsQuery(date, isOpen);
  const [selectedPreviewOptionId, setSelectedPreviewOptionId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = (option: QuickRebalanceOption) => {
    onApplyProposal(option.proposedBlocks, option.title);
    onClose();
  };

  const handleAskAIChat = () => {
    const prompt = `Hôm nay lịch trình ngày ${date} của tôi có mật độ tải trọng khá cao (${proposal?.loadScore || 78}/100). Hãy phân tích và gợi ý cho tôi một phương án phân bổ lại công việc để có thêm khoảng nghỉ êm ái.`;
    onOpenAIChatWithPrompt(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] relative"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60 bg-muted/20 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                  Tạo khoảng thở & Giảm tải nhận thức
                </h3>
                {proposal && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                    Tải: {proposal.loadScore}/100
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-lg leading-relaxed">
                Modo đã tính toán 3 phương án điều chỉnh tức thì. Bạn có thể xem trước khác biệt trước khi quyết định áp dụng.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl bg-muted/30 border border-border/50 animate-pulse space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted/60 rounded" />
                </div>
              ))}
            </div>
          ) : !proposal || proposal.options.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Coffee className="w-8 h-8 mx-auto text-muted-foreground/60" />
              <p className="text-sm font-semibold text-foreground">Lịch trình hôm nay đã rất cân bằng!</p>
              <p className="text-xs text-muted-foreground">Không phát hiện tình trạng quá tải cần điều chỉnh.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {proposal.options.map((opt) => {
                const isPreviewing = selectedPreviewOptionId === opt.id;

                const icon =
                  opt.type === 'ADD_BUFFER' ? (
                    <Coffee className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  ) : opt.type === 'MOVE_FLEXIBLE_TASK' ? (
                    <ArrowDownRight className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  );

                return (
                  <div
                    key={opt.id}
                    className={`rounded-2xl border transition-all ${
                      isPreviewing
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/25 shadow-sm'
                        : 'border-border/80 bg-background/60 hover:bg-muted/30'
                    }`}
                  >
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="size-8 rounded-xl bg-card border border-border/70 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                          {icon}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-foreground">
                              {opt.title}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              Giảm ~{opt.estimatedLoadReduction} điểm tải
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setSelectedPreviewOptionId(isPreviewing ? null : opt.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                            isPreviewing
                              ? 'border-primary bg-primary/15 text-primary'
                              : 'border-border hover:bg-muted text-foreground'
                          }`}
                        >
                          <Eye className="w-3 h-3" />
                          {isPreviewing ? 'Ẩn Diff' : 'Xem trước'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApply(opt)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          Áp dụng
                        </button>
                      </div>
                    </div>

                    {/* Expandable Side-by-Side Diff Preview */}
                    <AnimatePresence>
                      {isPreviewing && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-t border-border/60 bg-muted/20 p-4 rounded-b-2xl overflow-hidden"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {/* Left: Current Schedule */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-muted-foreground pb-1 border-b border-border/50">
                                <span>Lịch trình Hiện tại</span>
                                <span>{currentBlocks.length} task</span>
                              </div>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {currentBlocks.map((b) => (
                                  <div
                                    key={b.id}
                                    className="p-2 rounded-xl bg-card border border-border/60 flex items-center justify-between"
                                  >
                                    <span className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[140px]">
                                      {b.title}
                                    </span>
                                    <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                                      {b.startTime} - {b.endTime}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right: Proposed Schedule */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold text-primary pb-1 border-b border-primary/20">
                                <span>Lịch trình Sau khi chỉnh</span>
                                <span>{opt.proposedBlocks.length} task</span>
                              </div>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                                {opt.proposedBlocks.map((b, idx) => {
                                  const orig = currentBlocks.find((c) => c.id === b.id);
                                  const isMoved = orig && (orig.startTime !== b.startTime || orig.endTime !== b.endTime);

                                  return (
                                    <div
                                      key={b.id || idx}
                                      className={`p-2 rounded-xl border flex items-center justify-between ${
                                        isMoved
                                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                                          : 'bg-card border-border/60'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-[140px]">
                                        {isMoved && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                            Dời
                                          </span>
                                        )}
                                        <span className="font-medium truncate">{b.title}</span>
                                      </div>
                                      <span className="font-mono text-[10px] font-bold shrink-0">
                                        {b.startTime} - {b.endTime}
                                      </span>
                                    </div>
                                  );
                                })}

                                {opt.diff.deferredBlockCount > 0 && (
                                  <div className="p-2 rounded-xl border border-dashed border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300 text-[11px] font-medium flex items-center gap-1.5">
                                    <ArrowRight className="w-3 h-3 text-sky-500" />
                                    Đã chuyển 1 task sang sáng mai 09:00
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer: Ask AI & Dismiss */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleAskAIChat}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Hỏi Modo phương án sắp xếp khác qua AI Chat
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer self-end sm:self-center"
          >
            Giữ nguyên lịch hiện tại
          </button>
        </div>
      </motion.div>
    </div>
  );
};
