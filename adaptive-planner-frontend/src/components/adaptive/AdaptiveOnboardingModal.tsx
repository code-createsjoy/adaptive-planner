import React, { useState } from 'react';
import { OnboardingAnswers } from '@/types/planner';
import { useSubmitOnboardingMutation } from '@/hooks/useAccessibilityProfile';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  Eye,
  Bell,
  Calendar,
  Heart,
  ShieldCheck,
  Volume2,
  Minimize2,
  Layers,
  Smile,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdaptiveOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdaptiveOnboardingModal: React.FC<AdaptiveOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const submitMutation = useSubmitOnboardingMutation();
  const profile = useAccessibilityStore((state) => state.profile);
  const setProfile = useAccessibilityStore((state) => state.setProfile);

  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    infoStyle: 'MIXED',
    distractionSensitivity: 'HIGH',
    reminderPreference: 'GENTLE',
    schedulePreference: 'FLEXIBLE',
  });

  React.useEffect(() => {
    if (isOpen && profile) {
      setStep(1);
      setAnswers({
        infoStyle: profile.visualDensity === 'high' ? 'VISUAL' : profile.visualDensity === 'low' ? 'TEXT' : 'MIXED',
        distractionSensitivity: profile.sensorySensitivity === 'high' ? 'HIGH' : profile.sensorySensitivity === 'medium' ? 'MEDIUM' : 'LOW',
        reminderPreference: profile.notificationStyle === 'gentle' ? 'GENTLE' : profile.notificationStyle === 'persistent' ? 'PERSISTENT' : 'STANDARD',
        schedulePreference: profile.scheduleStructure === 'flexible' ? 'FLEXIBLE' : profile.scheduleStructure === 'structured' ? 'STRUCTURED' : 'BALANCED',
      });
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 5) {
      setStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await submitMutation.mutateAsync(answers);
      setProfile({ onboardingCompleted: true });
      onClose();
    } catch (err) {
      console.error('Failed to save onboarding profile:', err);
      setProfile({ onboardingCompleted: true });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[92vh] relative"
      >
        {/* Progress Bar & Header */}
        <div className="p-5 sm:p-6 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                M
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Thiết lập Hồ sơ Thích ứng Cá nhân
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-primary shadow-xs'
                    : i < step
                    ? 'w-4 bg-primary/60'
                    : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          <AnimatePresence mode="wait">
            {/* Step 1: Info Style */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Câu hỏi 1 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    Bạn thích thông tin được trình bày như thế nào?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Modo sẽ tự điều chỉnh mật độ thị giác và cách sắp xếp khối công việc.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'VISUAL',
                      title: '🎨 Trực quan & Giàu màu sắc (Visual)',
                      desc: 'Nhiều icon, thanh tiến trình %, timeline trực quan để dễ nắm bắt toàn cảnh.',
                    },
                    {
                      id: 'TEXT',
                      title: '📝 Cấu trúc & Tối giản (Text & Minimal)',
                      desc: 'Ít màu, font chữ rõ ràng, hạn chế chi tiết đồ họa để tránh rối mắt.',
                    },
                    {
                      id: 'MIXED',
                      title: '✨ Cân bằng hài hòa (Mixed)',
                      desc: 'Vừa có timeline trực quan vừa có checklist chi tiết chuẩn xác.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.infoStyle === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, infoStyle: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Distraction Sensitivity */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Câu hỏi 2 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    Mức độ nhạy cảm với xao nhãng của bạn?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Giúp hệ thống quyết định số lượng task hiển thị đồng thời và mức độ animation.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'HIGH',
                      title: '🌪️ Dễ quá tải (Cần không gian tĩnh & tập trung cao)',
                      desc: 'Ưu tiên hiển thị Now → Next task, giảm animation, ẩn các widget phụ.',
                    },
                    {
                      id: 'MEDIUM',
                      title: '⚖️ Trung bình (Thỉnh thoảng mất tập trung)',
                      desc: 'Hiển thị timeline bán phần kèm nhắc nhở chuyển tiếp nhẹ nhàng.',
                    },
                    {
                      id: 'LOW',
                      title: '🍃 Thấp (Tập trung tốt & thích xem nhiều việc)',
                      desc: 'Xem đầy đủ 24 giờ cả ngày và quản lý nhiều danh sách cùng lúc.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.distractionSensitivity === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, distractionSensitivity: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Reminder Preference */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Câu hỏi 3 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    Bạn muốn nhận nhắc nhở & âm báo như thế nào?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tránh các âm thanh giật mình gây căng thẳng cảm xúc.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'GENTLE',
                      title: '🕊️ Êm dịu (Chuông sóng Sin 432Hz & Toast nhẹ)',
                      desc: 'Âm thanh chữa lành êm ái, nhắc nhở trước 10 phút để chuyển đổi tâm lý êm đềm.',
                    },
                    {
                      id: 'STANDARD',
                      title: '🔔 Tiêu chuẩn (Visual + Sound vừa phải)',
                      desc: 'Thông báo popup góc phải kèm chuông tinh tế đúng giờ bắt đầu.',
                    },
                    {
                      id: 'PERSISTENT',
                      title: '⏰ Rõ ràng & Dứt khoát (Persistent Cues)',
                      desc: 'Nổi bật thông báo nhiều nấc (30p, 10p, 0p) để không bỏ lỡ việc quan trọng.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.reminderPreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, reminderPreference: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4: Schedule Preference */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                    Câu hỏi 4 / 4
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mt-2.5">
                    Bạn thích cấu trúc lịch trình của mình ra sao?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Định hình cách AI đề xuất sắp xếp thời gian biểu hàng ngày.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    {
                      id: 'FLEXIBLE',
                      title: '🌊 Linh hoạt & Có Buffer Time (Adaptive)',
                      desc: 'Luôn chèn 10-15 phút đệm, dễ dàng dời task khi mệt mỏi mà không tạo áp lực.',
                    },
                    {
                      id: 'BALANCED',
                      title: '⚖️ Cân bằng (Balanced Flow)',
                      desc: 'Có routine cố định buổi sáng/tối nhưng buổi chiều linh hoạt theo năng lượng.',
                    },
                    {
                      id: 'STRUCTURED',
                      title: '📐 Cố định & Kỷ luật (Structured Timetable)',
                      desc: 'Khung giờ rõ ràng, khóa các block quan trọng không xê dịch.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.schedulePreference === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, schedulePreference: opt.id as any })}
                        className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm'
                            : 'border-border/80 bg-background/60 hover:bg-muted/50 hover:border-foreground/20'
                        }`}
                      >
                        <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{opt.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 5: Profile Summary Reveal */}
            {step === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-5 text-center py-2"
              >
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                  <Sparkles className="size-8" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-foreground">
                    Hồ sơ Thích ứng của bạn đã sẵn sàng!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Modo đã cấu hình giao diện và trợ lý AI phù hợp tối đa với nhịp sinh học và phong cách nhận thức của bạn.
                  </p>
                </div>

                {/* Generated Profile Summary Card */}
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-primary/15 pb-2">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-primary" /> Personal Accessibility Profile
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-primary/15 text-primary">
                      Tự động kích hoạt
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Eye className="size-3" /> Mật độ hiển thị:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.infoStyle === 'VISUAL' ? 'Trực quan (Visual)' : answers.infoStyle === 'TEXT' ? 'Tối giản (Minimal)' : 'Cân bằng (Mixed)'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Zap className="size-3 text-amber-500" /> Hỗ trợ tập trung:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.distractionSensitivity === 'HIGH' ? 'Now → Next task' : 'Timeline đa tầng'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Volume2 className="size-3 text-teal-500" /> Kiểu nhắc nhở:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.reminderPreference === 'GENTLE' ? 'Chuông 432Hz êm ái' : 'Tiêu chuẩn'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-background/80 border border-border/60 space-y-1">
                      <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                        <Calendar className="size-3 text-primary" /> Cấu trúc ngày:
                      </span>
                      <p className="font-bold text-foreground">
                        {answers.schedulePreference === 'FLEXIBLE' ? 'Thích ứng + Buffer' : 'Cố định'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="p-4 sm:p-5 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-3">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted text-foreground transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md hover:bg-primary/90 flex items-center gap-1.5 transition-all ml-auto cursor-pointer"
            >
              Tiếp tục <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={submitMutation.isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-lg hover:opacity-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {submitMutation.isPending ? 'Đang áp dụng...' : 'Bắt đầu trải nghiệm Modo'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
