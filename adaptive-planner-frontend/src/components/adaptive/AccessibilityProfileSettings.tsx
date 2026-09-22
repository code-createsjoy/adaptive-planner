import React, { useState } from 'react';
import { useAccessibilityStore } from '@/store/useAccessibilityStore';
import { useUpdateAccessibilityProfileMutation } from '@/hooks/useAccessibilityProfile';
import { AccessibilityProfile } from '@/types/planner';
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Check,
  Eye,
  Zap,
  Volume2,
  Clock,
  Layers,
  Heart,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessibilityProfileSettingsProps {
  onRetakeOnboarding: () => void;
}

export const AccessibilityProfileSettings: React.FC<AccessibilityProfileSettingsProps> = ({
  onRetakeOnboarding,
}) => {
  const profile = useAccessibilityStore((state) => state.profile);
  const setProfile = useAccessibilityStore((state) => state.setProfile);
  const updateMutation = useUpdateAccessibilityProfileMutation();

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleUpdate = async (updates: Partial<AccessibilityProfile>) => {
    setProfile(updates);
    setSaving(true);
    try {
      await updateMutation.mutateAsync(updates);
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 2000);
    } catch (err) {
      console.error('Failed to sync profile update:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header card with Universal Design Ethos */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-primary/10 via-background to-accent/10 border border-primary/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-foreground">
                Hồ sơ Thích ứng & Trải nghiệm Tiếp cận
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Universal Design
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onRetakeOnboarding}
            className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-semibold text-foreground hover:bg-muted hover:border-primary/40 flex items-center gap-2 shadow-xs transition-all self-start sm:self-center cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-primary" />
            Làm lại bài khảo sát (30s)
          </button>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 1. Mật độ thị giác (Visual Density) */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Mật độ hiển thị thông tin</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'MINIMAL', label: 'Tối giản', desc: 'Ít màu, font rõ' },
              { id: 'BALANCED', label: 'Cân bằng', desc: 'Hài hòa chuẩn' },
              { id: 'DETAILED', label: 'Trực quan', desc: 'Giàu biểu đồ & icon' },
            ].map((item) => {
              const isSelected = profile.visualDensity === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleUpdate({ visualDensity: item.id as any })}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/30'
                      : 'border-border/70 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Mức độ nhạy cảm giác quan (Sensory Sensitivity) */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Mức độ nhạy cảm thị giác & âm thanh</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'LOW', label: 'Tiêu chuẩn', desc: 'Hiệu ứng đầy đủ' },
              { id: 'MEDIUM', label: 'Vừa phải', desc: 'Giảm chuyển động' },
              { id: 'HIGH', label: 'Cao (Calm)', desc: 'Tĩnh lặng & êm dịu' },
            ].map((item) => {
              const isSelected = profile.sensorySensitivity === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleUpdate({
                      sensorySensitivity: item.id as any,
                      reducedMotion: item.id === 'HIGH',
                    })
                  }
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold shadow-xs ring-1 ring-teal-500/30'
                      : 'border-border/70 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Âm báo & Tần số chữa lành (Reminder Chime) */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Volume2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Âm thanh chuông thông báo</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { id: 'GENTLE_432HZ', label: '🕊️ Sóng 432Hz', desc: 'Êm ái không giật mình' },
              { id: 'STANDARD', label: '🔔 Tiêu chuẩn', desc: 'Chuông nhẹ nhàng' },
              { id: 'NONE', label: '🔕 Yên lặng', desc: 'Chỉ Toast hình ảnh' },
            ].map((item) => {
              const isSelected = (profile.reminderChime || 'GENTLE_432HZ') === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleUpdate({ reminderChime: item.id as any })}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs ring-1 ring-indigo-500/30'
                      : 'border-border/70 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Khung đệm thời gian (Buffer Time) */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-foreground">Khoảng đệm chuyển tiếp (Buffer)</h4>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { val: 0, label: '0 phút', desc: 'Lịch trình liền mạch' },
              { val: 10, label: '10 phút', desc: 'Khuyến nghị chuẩn' },
              { val: 15, label: '15 phút', desc: 'Thư thả & phục hồi' },
            ].map((item) => {
              const isSelected = profile.bufferTimeMinutes === item.val;
              return (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => handleUpdate({ bufferTimeMinutes: item.val })}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold shadow-xs ring-1 ring-amber-500/30'
                      : 'border-border/70 hover:bg-muted/50 text-foreground'
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reduced Motion & Feedback Strip */}
      <div className="p-4.5 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="size-4 text-muted-foreground" />
          <p className="text-xs font-bold text-foreground">Giảm chuyển động (Reduced Motion)</p>
        </div>

        <button
          type="button"
          onClick={() => handleUpdate({ reducedMotion: !profile.reducedMotion })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            profile.reducedMotion ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              profile.reducedMotion ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-xl"
        >
          <Check className="size-4 stroke-[3]" />
          Đã lưu tùy chỉnh Hồ sơ Thích ứng!
        </motion.div>
      )}
    </div>
  );
};
