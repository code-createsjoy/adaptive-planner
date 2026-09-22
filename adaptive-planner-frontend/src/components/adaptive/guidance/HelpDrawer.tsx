import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Clock,
  Zap,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { useGuidanceStore, GuidanceStyle } from '@/store/useGuidanceStore';

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onReplayTour: () => void;
}

interface HelpTopic {
  id: string;
  icon: React.ReactNode;
  title: string;
  summary: string;
  details: string;
  tipExample?: string;
}

const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'now-card',
    icon: <Target className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Tôi nên làm gì lúc này? (Thẻ NOW)',
    summary: 'Modo luôn ghim công việc quan trọng nhất tại thời điểm hiện tại.',
    details: 'Thay vì một danh sách dài vô tận gây quá tải nhận thức, thẻ NOW chỉ tập trung vào việc đang làm cùng thanh tiến độ thời gian thực và các bước vi mô (micro-steps).',
  },
  {
    id: 'next-buffer',
    icon: <Clock className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Việc tiếp theo là gì? (Khoảng đệm NEXT)',
    summary: 'Biết trước việc sắp tới mà không cần lo lắng về giờ giấc.',
    details: 'Modo tự động chèn các khoảng đệm chuyển tiếp (+15m buffer) giữa các công việc để bộ não của bạn có thời gian chuyển giao êm dịu, không bị giật mình hay kiệt sức.',
  },
  {
    id: 'add-task',
    icon: <Sparkles className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Cách lên lịch bằng ngôn ngữ tự nhiên',
    summary: 'Nhắn siêu ngắn như đang chat với bạn thân.',
    details: 'Bạn có thể gõ câu cụt lủn vào ô AI Chat. Modo sẽ tự động bóc tách ngày giờ và xếp vào thời gian biểu.',
    tipExample: 'Ví dụ: "mai 7h cafe 2h", "t2 họp team 9h", "chiều nay gym 17h30 1h"',
  },
  {
    id: 'focus-mode',
    icon: <Zap className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Chế độ Tập trung (Focus Mode)',
    summary: 'Làm việc trong không gian yên tĩnh và có kiểm soát.',
    details: 'Khi bắt đầu Focus, Modo ẩn toàn bộ các công việc khác, bật bộ đếm ngược trực quan và hỗ trợ âm thanh nền thư giãn giúp bạn duy trì dòng chảy tập trung.',
  },
  {
    id: 'ask-modo',
    icon: <MessageSquare className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Hỏi Modo phân rã việc khó hoặc tái cân bằng',
    summary: 'Vượt qua sức ỳ khi một công việc quá lớn hoặc khi quá tải.',
    details: 'Nếu bạn cảm thấy bế tắc, hãy bấm "Break it down" hoặc nhắn cho Modo. AI sẽ chia công việc thành 2-3 bước nhỏ cực dễ bắt đầu.',
    tipExample: 'Ví dụ: "Tôi đang bị quá tải, hãy dời bớt việc không gấp sang ngày mai"',
  },
  {
    id: 'insights',
    icon: <BarChart3 className="size-4 text-teal-600 dark:text-teal-400" />,
    title: 'Hiểu Tải trọng (Workload) & Xu hướng tuần',
    summary: 'Tìm ra nhịp sinh học tự nhiên, không phải điểm số phán xét.',
    details: 'Modo quan sát mức độ tiêu hao năng lượng để cảnh báo ngày quá tải và gợi ý khoảng nghỉ, giúp bạn xây dựng thói quen làm việc bền vững và trắc ẩn với bản thân.',
  },
];

export const HelpDrawer: React.FC<HelpDrawerProps> = ({
  isOpen,
  onClose,
  onReplayTour,
}) => {
  const { guidanceStyle, setGuidanceStyle, resetAllGuidance } = useGuidanceStore();
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10005] flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Content */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col overflow-hidden text-foreground"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/80 flex items-center justify-between bg-card/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                <BookOpen className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-foreground">Trợ giúp nhanh (Quick Help)</h2>
                <p className="text-xs text-muted-foreground">Học cách làm chủ Modo qua từng hành động</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Đóng (Esc)"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Quick Tour Action Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-background to-emerald-500/10 border border-teal-500/25 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-200 uppercase tracking-wider">
                  Hướng dẫn tương tác
                </span>
                <span className="text-[11px] font-medium text-muted-foreground">30–45 giây</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trải nghiệm lại hành trình 5 bước tương tác trực quan ngay trên giao diện thật của bạn.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReplayTour();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Play className="size-3.5 fill-white" />
                  Xem lại Dashboard Tour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAllGuidance();
                    onClose();
                    onReplayTour();
                  }}
                  className="px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Xóa lịch sử mẹo đã xem và bắt đầu lại từ đầu"
                >
                  <RotateCcw className="size-3.5 text-muted-foreground" />
                  Đặt lại tất cả
                </button>
              </div>
            </div>

            {/* Guidance Density Style Preference */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Độ chi tiết của hướng dẫn</label>
              <div className="grid grid-cols-3 gap-2">
                {(['minimal', 'guided', 'detailed'] as GuidanceStyle[]).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setGuidanceStyle(style)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center capitalize cursor-pointer ${
                      guidanceStyle === style
                        ? 'border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300 shadow-2xs font-bold'
                        : 'border-border bg-card/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {style === 'minimal' ? 'Tối giản' : style === 'guided' ? 'Chuẩn' : 'Chi tiết'}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro Guides Accordion */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Chủ đề thường gặp
              </h3>

              <div className="space-y-2">
                {HELP_TOPICS.map((topic) => {
                  const isExpanded = expandedTopic === topic.id;
                  return (
                    <div
                      key={topic.id}
                      className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                        className="w-full p-3.5 flex items-center justify-between text-left gap-3 hover:bg-muted/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {topic.icon}
                          </div>
                          <span className="text-xs font-bold text-foreground truncate">
                            {topic.title}
                          </span>
                        </div>
                        <ChevronDown
                          className={`size-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                            isExpanded ? 'rotate-180 text-teal-600' : ''
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4 pt-1 text-xs text-muted-foreground space-y-2 border-t border-border/40 bg-muted/20"
                        >
                          <p className="leading-relaxed">{topic.details}</p>
                          {topic.tipExample && (
                            <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 border border-teal-200/50 dark:border-teal-800/40 text-[11px] font-medium font-mono">
                              💡 {topic.tipExample}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border/80 bg-card/80 text-center">
            <p className="text-[11px] text-muted-foreground">
              Nguyên tắc: Đơn giản theo mặc định · Chi tiết khi bạn cần.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
