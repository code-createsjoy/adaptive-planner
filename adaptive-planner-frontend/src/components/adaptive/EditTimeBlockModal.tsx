import React, { useState, useEffect } from 'react';
import {
  TimeBlock,
  BlockCategory,
  EnergyLevel,
} from '@/types/planner';
import {
  useUpdateTimeBlockMutation,
  useCreateTimeBlockMutation,
  useUpdateRoutineMutation,
} from '@/hooks/useTimeBlocks';
import {
  X,
  Clock,
  Pencil,
  AlertTriangle,
  Check,
  Calendar,
  Sparkles,
  MapPin,
  Tag,
  Zap,
  Shield,
  Bell,
  Layers,
} from 'lucide-react';

interface EditTimeBlockModalProps {
  isOpen: boolean;
  block: TimeBlock | null;
  targetDate?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

function timeToMinutes(timeStr: string): number {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  } catch {
    return 0;
  }
}

function formatDateVietnamese(dateStr?: string) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ngày ${d} tháng ${m}, ${y}`;
  } catch {
    return dateStr;
  }
}

export const EditTimeBlockModal: React.FC<EditTimeBlockModalProps> = ({
  isOpen,
  block,
  targetDate,
  onClose,
  onSuccess,
}) => {
  const updateBlockMutation = useUpdateTimeBlockMutation();
  const createBlockMutation = useCreateTimeBlockMutation();
  const updateRoutineMutation = useUpdateRoutineMutation();

  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [category, setCategory] = useState<BlockCategory>('work');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<string>('Normal');
  const [reminders, setReminders] = useState<number[]>([30, 10, 0]);
  const [editRoutineScope, setEditRoutineScope] = useState<'single_day' | 'all_weeks'>('single_day');

  const isRoutine = Boolean(
    block &&
      (block.sourceType === 'ROUTINE' ||
        (block.id && typeof block.id === 'string' && block.id.startsWith('routine-')))
  );

  const routineId = block
    ? block.sourceRoutineId ||
      (block.id && typeof block.id === 'string' && block.id.startsWith('routine-')
        ? parseInt(block.id.split('-')[1], 10)
        : undefined)
    : undefined;

  useEffect(() => {
    if (block) {
      setTitle(block.title || '');
      setDetail(block.detail || '');
      setStartTime(block.startTime || '09:00');
      setEndTime(block.endTime || '10:00');
      setCategory(block.category || 'work');
      setEnergyLevel(block.energyLevel || 'medium');
      setPriority(block.priority || 'Normal');
      setReminders(
        block.reminderMinutesBefore && block.reminderMinutesBefore.length > 0
          ? block.reminderMinutesBefore
          : [30, 10, 0]
      );
      setEditRoutineScope('single_day');
    }
  }, [block]);

  if (!isOpen || !block) return null;

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);
  const isTimeOrderValid = endMin > startMin;
  const effectiveDate = targetDate || block.date;

  const isSaving =
    updateBlockMutation.isPending ||
    createBlockMutation.isPending ||
    updateRoutineMutation.isPending;

  const toggleReminder = (min: number) => {
    setReminders((prev) =>
      prev.includes(min) ? prev.filter((m) => m !== min) : [...prev, min].sort((a, b) => b - a)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !isTimeOrderValid) return;

    try {
      if (isRoutine && routineId && editRoutineScope === 'all_weeks') {
        // Cập nhật mẫu hàng tuần gốc
        await updateRoutineMutation.mutateAsync({
          id: routineId,
          updates: {
            title: title.trim(),
            detail: detail.trim(),
            startTime,
            endTime,
            category,
            energyLevel,
            priority: priority as any,
            reminderMinutesBefore: reminders,
          },
          updateAllMatching: false,
        });
      } else if (isRoutine && routineId && (!block.id || block.id.startsWith('routine-'))) {
        // Routine chiếu chưa được lưu thành entity riêng -> tạo override cho ngày này
        await createBlockMutation.mutateAsync({
          title: title.trim(),
          detail: detail.trim(),
          startTime,
          endTime,
          category,
          energyLevel,
          priority,
          reminderMinutesBefore: reminders,
          isBufferBlock: false,
          date: effectiveDate,
          sourceType: 'ROUTINE',
          sourceRoutineId: routineId,
          overrideType: 'MODIFIED',
        });
      } else {
        // TimeBlock đã lưu (custom hoặc đã là override)
        await updateBlockMutation.mutateAsync({
          id: block.id,
          updates: {
            title: title.trim(),
            detail: detail.trim(),
            startTime,
            endTime,
            category,
            energyLevel,
            priority: priority as any,
            reminderMinutesBefore: reminders,
            date: effectiveDate,
          },
        });
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to update schedule block:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">
                  Chỉnh sửa hoạt động
                </h3>
                {isRoutine && (
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 text-[10px] font-bold border border-sky-500/20 font-mono">
                    ROUTINE
                  </span>
                )}
                {!isRoutine && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20 font-mono">
                    LỊCH RIÊNG
                  </span>
                )}
              </div>
              {effectiveDate && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 opacity-60" />
                  <span>{formatDateVietnamese(effectiveDate)}</span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Routine edit scope selector if applicable */}
          {isRoutine && (
            <div className="p-3 rounded-xl border border-sky-500/30 bg-sky-500/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-300">
                <Layers className="w-4 h-4" />
                <span>Phạm vi áp dụng chỉnh sửa:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setEditRoutineScope('single_day')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    editRoutineScope === 'single_day'
                      ? 'border-sky-500 bg-sky-500/20 font-bold text-sky-800 dark:text-sky-200'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:border-sky-500/40'
                  }`}
                >
                  <p className="flex items-center gap-1.5">
                    {editRoutineScope === 'single_day' && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                    <span>Chỉ áp dụng ngày này</span>
                  </p>
                  <p className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Không ảnh hưởng các tuần khác
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setEditRoutineScope('all_weeks')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    editRoutineScope === 'all_weeks'
                      ? 'border-sky-500 bg-sky-500/20 font-bold text-sky-800 dark:text-sky-200'
                      : 'border-border/60 bg-background/50 text-muted-foreground hover:border-sky-500/40'
                  }`}
                >
                  <p className="flex items-center gap-1.5">
                    {editRoutineScope === 'all_weeks' && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />}
                    <span>Toàn bộ các tuần tới</span>
                  </p>
                  <p className="text-[10px] font-normal text-muted-foreground mt-0.5">
                    Cập nhật vào Routine mẫu gốc
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Title & Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Tên hoạt động <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Ăn tối, Làm báo cáo, Thể thao..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                Địa điểm / Ghi chú chi tiết
              </label>
              <input
                type="text"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Ví dụ: Landmark 81, Zoom meeting, Phòng tập gym..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 ${
                  !isTimeOrderValid
                    ? 'border-destructive text-destructive'
                    : 'border-border focus:ring-primary/20'
                }`}
              />
            </div>
          </div>

          {!isTimeOrderValid && (
            <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Giờ kết thúc ({endTime}) phải diễn ra sau giờ bắt đầu ({startTime}).</span>
            </div>
          )}

          {/* Category, Energy & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                Phân loại
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BlockCategory)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="work">💼 Công việc (Work)</option>
                <option value="social">👥 Xã hội / Đi chơi (Social)</option>
                <option value="health">🏃 Sức khỏe (Health)</option>
                <option value="rest">☕ Thư giãn (Rest)</option>
                <option value="transition">🔄 Chuyển tiếp (Buffer)</option>
                <option value="urgent">⚡ Khẩn cấp (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                Năng lượng
              </label>
              <select
                value={energyLevel}
                onChange={(e) => setEnergyLevel(e.target.value as EnergyLevel)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="high">⚡ High Energy</option>
                <option value="medium">🔋 Medium Energy</option>
                <option value="low">🌱 Low Energy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1 mb-1">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                Ưu tiên
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Normal">Bình thường (Normal)</option>
                <option value="High">Ưu tiên cao (High)</option>
                <option value="Protected">Cố định (Protected)</option>
              </select>
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              Nhắc nhở trước (Reminders)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { min: 30, label: '30 phút trước' },
                { min: 15, label: '15 phút trước' },
                { min: 10, label: '10 phút trước' },
                { min: 0, label: 'Đúng giờ' },
              ].map(({ min, label }) => {
                const isSelected = reminders.includes(min);
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => toggleReminder(min)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline-block mr-1" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !isTimeOrderValid || isSaving}
              className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-primary/25 transition-all"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
