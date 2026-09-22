import React, { useState, useMemo } from 'react';
import { usePlannerStore, getTodayDateString } from '@/store/usePlannerStore';
import {
  useMonthlySummaryQuery,
  usePurgeAllBlocksMutation,
  useTimeBlocksQuery,
  useCheckHolidayQuery,
  useCreateTimeBlockMutation,
  useDeleteTimeBlockMutation,
  useCancelRoutineForDateMutation,
} from '@/hooks/useTimeBlocks';
import {
  useDailyCheckinsQuery,
  useDailyCheckinByDateQuery,
  useCyclePredictionsQuery,
} from '@/hooks/useDailyCheckins';
import { BlockCategory, EnergyLevel, TimeBlock, DailyCheckin } from '@/types/planner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Settings2,
  Trash2,
  Clock,
  Pencil,
  X,
  ExternalLink,
  MapPin,
  Sparkles,
  AlertTriangle,
  Coffee,
  Check,
  Smile,
  Heart,
  Droplets,
} from 'lucide-react';
import { EditTimeBlockModal } from './EditTimeBlockModal';
import { DailyCheckinPopover } from './DailyCheckinPopover';

interface MonthCalendarViewProps {
  onSelectDate?: (dateStr: string) => void;
}

function formatDateVietnamese(dateStr: string) {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ngày ${d} tháng ${m}, ${y}`;
  } catch {
    return dateStr;
  }
}

function timeToMinutes(timeStr: string): number {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  } catch {
    return 0;
  }
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({ onSelectDate }) => {
  const selectedDate = usePlannerStore((state) => state.selectedDate);
  const setSelectedDate = usePlannerStore((state) => state.setSelectedDate);
  const setIsRoutineModalOpen = usePlannerStore((state) => state.setIsRoutineModalOpen);

  const purgeMutation = usePurgeAllBlocksMutation();

  // Selected calendar month/year
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12

  // State for Day Detail Popup Modal & Daily Checkin Popover
  const [popupDate, setPopupDate] = useState<string | null>(null);
  const [activeCheckinDate, setActiveCheckinDate] = useState<string | null>(null);

  const { data: monthlyData, isLoading } = useMonthlySummaryQuery(currentYear, currentMonth);

  // Build calendar matrix (Mon = 0, Sun = 6)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
  const totalDays = lastDayOfMonth.getDate();
  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;

  const startDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const endDateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(totalDays).padStart(2, '0')}`;

  const { data: checkinList = [] } = useDailyCheckinsQuery(startDateStr, endDateStr);
  const { data: cyclePredictions } = useCyclePredictionsQuery();

  const checkinMap = useMemo(() => {
    const map = new Map<string, DailyCheckin>();
    if (checkinList) {
      checkinList.forEach((c) => map.set(c.checkinDate, c));
    }
    return map;
  }, [checkinList]);

  const isPredictedCycleDate = (dateStr: string) => {
    if (!cyclePredictions?.predictedWindows) return false;
    return cyclePredictions.predictedWindows.some(
      (w) => w.startDate <= dateStr && dateStr <= w.endDate
    );
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth() + 1);
    const todayStr = getTodayDateString();
    setSelectedDate(todayStr);
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setPopupDate(dateStr);
  };

  const handleOpenFullTimeline = (dateStr: string) => {
    setSelectedDate(dateStr);
    setPopupDate(null);
    if (onSelectDate) {
      onSelectDate(dateStr);
    }
  };

  // Day summary lookup map
  const daySummaryMap = useMemo(() => {
    const map = new Map<string, { totalTasks: number; isHoliday: boolean; holidayName?: string; isStatutory?: boolean }>();
    if (monthlyData?.days) {
      for (const d of monthlyData.days) {
        map.set(d.date, d);
      }
    }
    return map;
  }, [monthlyData]);

  const monthNames = [
    'Tháng 1 (January)', 'Tháng 2 (February)', 'Tháng 3 (March)', 'Tháng 4 (April)',
    'Tháng 5 (May)', 'Tháng 6 (June)', 'Tháng 7 (July)', 'Tháng 8 (August)',
    'Tháng 9 (September)', 'Tháng 10 (October)', 'Tháng 11 (November)', 'Tháng 12 (December)'
  ];

  const weekHeaders = ['Thứ 2 (Mon)', 'Thứ 3 (Tue)', 'Thứ 4 (Wed)', 'Thứ 5 (Thu)', 'Thứ 6 (Fri)', 'Thứ 7 (Sat)', 'CN (Sun)'];
  const todayStr = getTodayDateString();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Calendar Header Controls */}
      <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                {monthNames[currentMonth - 1]} {currentYear}
              </h2>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted/80 transition-colors flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-primary" />
              Hôm nay (Today)
            </button>

            <div className="flex items-center bg-muted/60 rounded-xl p-1 border border-border/50">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Tháng trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-semibold text-foreground/80">
                {String(currentMonth).padStart(2, '0')}/{currentYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-card rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Tháng sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsRoutineModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20"
            >
              <Settings2 className="w-3.5 h-3.5" />
              Thời khóa biểu tuần (Routine)
            </button>

            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa sạch toàn bộ các block tùy chỉnh để bắt đầu mới hoàn toàn?')) {
                  purgeMutation.mutate();
                }
              }}
              className="p-2 rounded-xl border border-destructive/20 text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-colors text-xs"
              title="Dọn sạch lịch tùy chỉnh (Wipe Custom Timeblocks)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-6 shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {weekHeaders.map((header, idx) => (
            <div
              key={header}
              className={`text-center py-2 text-xs font-semibold uppercase tracking-wider rounded-lg ${
                idx >= 5 ? 'text-amber-600 dark:text-amber-400/80 bg-amber-500/5' : 'text-muted-foreground bg-muted/30'
              }`}
            >
              {header}
            </div>
          ))}
        </div>

        {/* Month Cells Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="min-h-[90px] sm:min-h-[110px] rounded-xl border border-dashed border-border/30 bg-muted/10 opacity-30 pointer-events-none"
            />
          ))}

          {/* Days of Month */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const daySummary = daySummaryMap.get(dateStr);
            const totalTasks = daySummary?.totalTasks || 0;
            const isHoliday = daySummary?.isHoliday;
            const holidayName = daySummary?.holidayName;

            const checkin = checkinMap.get(dateStr);
            const isConfirmedPeriod = Boolean(checkin?.isPeriodDay);
            const isPredictedPeriod = !isConfirmedPeriod && isPredictedCycleDate(dateStr);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => handleDayClick(dateStr)}
                className={`group relative min-h-[95px] sm:min-h-[115px] p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer hover:shadow-md ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md scale-[1.01]'
                    : isToday
                    ? 'border-primary/50 bg-primary/[0.02] hover:border-primary hover:bg-muted/50'
                    : isConfirmedPeriod
                    ? 'border-rose-500/50 bg-rose-500/[0.07] hover:border-rose-500/80 hover:bg-rose-500/12 ring-1 ring-rose-500/20'
                    : isPredictedPeriod
                    ? 'border-dashed border-rose-400/50 bg-rose-500/[0.03] hover:border-rose-400/80 hover:bg-rose-500/08'
                    : isHoliday
                    ? 'border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/60 hover:bg-rose-500/10'
                    : 'border-border/70 bg-card hover:border-foreground/30 hover:bg-muted/40'
                }`}
              >
                {/* Top: Date Number, Badges & Mood/Period */}
                <div className="flex items-start justify-between w-full gap-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold rounded-lg transition-transform group-hover:scale-105 ${
                        isToday
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 shadow-sm'
                          : isSelected
                          ? 'bg-foreground text-background'
                          : 'text-foreground/90 group-hover:text-foreground'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Mood Emoji Badge if logged */}
                    {checkin?.moodEmoji && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCheckinDate(dateStr);
                        }}
                        className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-background/90 border border-border shadow-2xs text-sm hover:scale-110 transition-transform"
                        title={`Mood: ${checkin.moodLabel || checkin.moodEmoji}${checkin.note ? `\nNote: ${checkin.note}` : ''}`}
                      >
                        {checkin.moodEmoji}
                      </span>
                    )}

                    {/* Note indicator dot */}
                    {checkin?.note && !checkin.moodEmoji && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCheckinDate(dateStr);
                        }}
                        className="text-xs text-primary/80 hover:scale-110 transition-transform"
                        title={`Note: ${checkin.note}`}
                      >
                        📝
                      </span>
                    )}
                  </div>

                  {/* Right side indicators: Holiday, Period */}
                  <div className="flex items-center gap-1">
                    {isConfirmedPeriod && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCheckinDate(dateStr);
                        }}
                        className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold shadow-2xs flex items-center gap-0.5 hover:opacity-90"
                        title={`Chu kỳ kinh nguyệt (${checkin?.flowIntensity || 'Đang diễn ra'})`}
                      >
                        🩸 <span className="hidden xl:inline text-[9px]">{checkin?.flowIntensity === 'HEAVY' ? 'Nhiều' : 'Kỳ'}</span>
                      </span>
                    )}

                    {isPredictedPeriod && (
                      <span
                        className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-dashed border-rose-500/30 text-[9px] font-semibold hidden xl:inline-flex items-center gap-0.5"
                        title="Dự kiến chu kỳ kinh nguyệt"
                      >
                        🩸 Dự kiến
                      </span>
                    )}

                    {isHoliday && (
                      <span
                        className="px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/20 flex items-center gap-1 shadow-2xs"
                        title={holidayName}
                      >
                        🇻🇳 <span className="hidden xl:inline truncate max-w-[55px]">{holidayName}</span>
                      </span>
                    )}

                    {/* Quick check-in shortcut for unlogged days */}
                    {!checkin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCheckinDate(dateStr);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center text-xs"
                        title="Check-in cảm xúc & chu kỳ ngày này"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Holiday Label for mobile/tablet if present */}
                {isHoliday && (
                  <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 line-clamp-1 mt-1 xl:hidden">
                    {holidayName}
                  </p>
                )}

                {/* Bottom: Task count & density dots */}
                <div className="mt-auto pt-1 w-full flex items-center justify-between border-t border-border/30">
                  <div className="flex items-center gap-1">
                    {totalTasks === 0 ? (
                      <span className="text-[10px] text-muted-foreground/60 italic group-hover:text-primary">
                        + Thêm lịch
                      </span>
                    ) : (
                      <>
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(totalTasks, 4) }).map((_, dotIdx) => (
                            <span
                              key={dotIdx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConfirmedPeriod
                                  ? 'bg-rose-500'
                                  : isHoliday
                                  ? 'bg-rose-500'
                                  : 'bg-primary'
                              }`}
                            />
                          ))}
                          {totalTasks > 4 && (
                            <span className="text-[9px] font-bold text-muted-foreground leading-none">
                              +{totalTasks - 4}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {totalTasks > 0 && (
                    <span className="font-mono text-[10px] text-muted-foreground font-semibold">
                      {totalTasks} task{totalTasks > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail & Quick Schedule Popup Modal */}
      {popupDate && (
        <DayDetailPopupModal
          dateStr={popupDate}
          onClose={() => setPopupDate(null)}
          onOpenFullTimeline={() => handleOpenFullTimeline(popupDate)}
          onOpenCheckin={() => setActiveCheckinDate(popupDate)}
        />
      )}

      {/* Daily Checkin & Mood / Period Popover Modal */}
      {activeCheckinDate && (
        <DailyCheckinPopover
          dateStr={activeCheckinDate}
          isOpen={Boolean(activeCheckinDate)}
          onClose={() => setActiveCheckinDate(null)}
        />
      )}
    </div>
  );
};

interface DayDetailPopupModalProps {
  dateStr: string;
  onClose: () => void;
  onOpenFullTimeline: () => void;
  onOpenCheckin?: () => void;
}

const DayDetailPopupModal: React.FC<DayDetailPopupModalProps> = ({
  dateStr,
  onClose,
  onOpenFullTimeline,
  onOpenCheckin,
}) => {
  const { data: blocks = [], isLoading } = useTimeBlocksQuery(dateStr);
  const { data: holidayData } = useCheckHolidayQuery(dateStr);
  const { data: checkin } = useDailyCheckinByDateQuery(dateStr);

  const createBlockMutation = useCreateTimeBlockMutation();
  const deleteBlockMutation = useDeleteTimeBlockMutation();
  const cancelRoutineMutation = useCancelRoutineForDateMutation();

  // Edit modal state
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  // Form state for adding custom event
  const [isAddingOpen, setIsAddingOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDetail, setNewDetail] = useState('');
  const [newStartTime, setNewStartTime] = useState('19:00');
  const [newEndTime, setNewEndTime] = useState('21:00');
  const [newCategory, setNewCategory] = useState<BlockCategory>('social');
  const [newEnergyLevel, setNewEnergyLevel] = useState<EnergyLevel>('medium');

  const startMin = timeToMinutes(newStartTime);
  const endMin = timeToMinutes(newEndTime);
  const isTimeOrderValid = endMin > startMin;

  const isPastDay = dateStr < getTodayDateString();

  const handleQuickPreset = (preset: {
    title: string;
    detail: string;
    startTime: string;
    endTime: string;
    category: BlockCategory;
    energyLevel: EnergyLevel;
  }) => {
    if (isPastDay) return;
    setNewTitle(preset.title);
    setNewDetail(preset.detail);
    setNewStartTime(preset.startTime);
    setNewEndTime(preset.endTime);
    setNewCategory(preset.category);
    setNewEnergyLevel(preset.energyLevel);
    setIsAddingOpen(true);
  };

  const handleCreateCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPastDay || !newTitle.trim() || !isTimeOrderValid) return;

    createBlockMutation.mutate({
      title: newTitle.trim(),
      detail: newDetail.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      category: newCategory,
      energyLevel: newEnergyLevel,
      priority: 'Normal',
      reminderMinutesBefore: [30, 10, 0],
      isBufferBlock: false,
      date: dateStr,
      sourceType: 'CUSTOM',
      overrideType: 'NONE',
    });

    setNewTitle('');
    setNewDetail('');
    setIsAddingOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {formatDateVietnamese(dateStr)}
                </h3>
                {holidayData?.isStatutory && (
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
                    🇻🇳 {holidayData.name || holidayData.holidayName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenFullTimeline}
              className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              title="Mở toàn bộ ngày trên Day Timeline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở Timeline</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Daily Check-in & Mood / Period Status Card */}
          <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/25 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-xl shadow-xs">
                {checkin?.moodEmoji || '🙂'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    {checkin ? checkin.moodLabel || 'Đã Check-in' : 'Chưa Check-in ngày này'}
                  </span>
                  {checkin?.isPeriodDay && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                      🩸 Chu kỳ ({checkin.flowIntensity})
                    </span>
                  )}
                  {checkin?.energyLevel && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      ⚡ {checkin.energyLevel}/5
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {checkin?.note ? `"${checkin.note}"` : 'Ghi nhận cảm xúc, mức năng lượng và sức khỏe'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCheckin}
              className="px-3 py-1.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 text-xs font-bold transition-colors shrink-0"
            >
              {checkin ? 'Sửa Check-in' : '+ Check-in ngay'}
            </button>
          </div>

          {isPastDay ? (
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-800 dark:text-amber-300">Ngày trong quá khứ</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Không thể tạo mới lịch trình cho những ngày đã qua. Bạn chỉ có thể xem lại lịch sử các hoạt động đã diễn ra.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Quick Ideas for Outings / Hangouts / Special Events */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    Gợi ý lên lịch nhanh (Đi chơi, Cafe, Thư giãn)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset({
                        title: '☕ Cà phê & Gặp gỡ bạn bè',
                        detail: 'Trò chuyện thư giãn cuối tuần',
                        startTime: '09:00',
                        endTime: '11:30',
                        category: 'social',
                        energyLevel: 'low',
                      })
                    }
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex flex-col justify-between group"
                  >
                    <span className="font-bold text-foreground group-hover:text-primary">☕ Cà phê bạn bè</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">09:00 – 11:30</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset({
                        title: '🚗 Đi chơi / Dã ngoại ngoài trời',
                        detail: 'Outdoor hangout & food trip',
                        startTime: '14:00',
                        endTime: '18:00',
                        category: 'social',
                        energyLevel: 'medium',
                      })
                    }
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex flex-col justify-between group"
                  >
                    <span className="font-bold text-foreground group-hover:text-primary">🚗 Dã ngoại / Đi chơi</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">14:00 – 18:00</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset({
                        title: '🎬 Xem phim & Ăn tối',
                        detail: 'Cinema & dinner relaxation',
                        startTime: '19:00',
                        endTime: '22:00',
                        category: 'rest',
                        energyLevel: 'low',
                      })
                    }
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex flex-col justify-between group"
                  >
                    <span className="font-bold text-foreground group-hover:text-primary">🎬 Xem phim & Ăn tối</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">19:00 – 22:00</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickPreset({
                        title: '🏃 Thể thao & Chạy bộ',
                        detail: 'Cardio & recharge',
                        startTime: '06:30',
                        endTime: '08:00',
                        category: 'health',
                        energyLevel: 'high',
                      })
                    }
                    className="p-2.5 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex flex-col justify-between group"
                  >
                    <span className="font-bold text-foreground group-hover:text-primary">🏃 Chạy bộ / Thể thao</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">06:30 – 08:00</span>
                  </button>
                </div>
              </div>

              {/* Form to Add Custom Time Slot for this specific day */}
              <div className="border border-border/80 rounded-2xl p-4 bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary" />
                    Thêm khung giờ riêng cho ngày này
                  </span>
                  {!isAddingOpen && (
                    <button
                      type="button"
                      onClick={() => setIsAddingOpen(true)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      + Mở form nhập
                    </button>
                  )}
                </div>

                {isAddingOpen && (
                  <form onSubmit={handleCreateCustomBlock} className="space-y-3 pt-2 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Tên hoạt động *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: Đi chơi Đà Lạt, Họp nhóm, Ăn tối..."
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Địa điểm / Ghi chú
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: The Coffee House, Landmark..."
                          value={newDetail}
                          onChange={(e) => setNewDetail(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Giờ bắt đầu
                        </label>
                        <input
                          type="time"
                          required
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Giờ kết thúc
                        </label>
                        <input
                          type="time"
                          required
                          value={newEndTime}
                          onChange={(e) => setNewEndTime(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 ${
                            !isTimeOrderValid ? 'border-destructive text-destructive' : 'border-border focus:ring-primary/20'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Phân loại
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as BlockCategory)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="social">Xã hội & Đi chơi (Social)</option>
                          <option value="rest">Thư giãn (Rest)</option>
                          <option value="health">Sức khỏe (Health)</option>
                          <option value="work">Công việc (Work)</option>
                          <option value="transition">Chuyển tiếp (Buffer)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">
                          Năng lượng
                        </label>
                        <select
                          value={newEnergyLevel}
                          onChange={(e) => setNewEnergyLevel(e.target.value as EnergyLevel)}
                          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="high">⚡ High Energy</option>
                          <option value="medium">🔋 Medium Energy</option>
                          <option value="low">🌱 Low Energy</option>
                        </select>
                      </div>
                    </div>

                    {!isTimeOrderValid && (
                      <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Giờ kết thúc ({newEndTime}) phải sau giờ bắt đầu ({newStartTime}).</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingOpen(false)}
                        className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-xl"
                      >
                        Đóng form
                      </button>
                      <button
                        type="submit"
                        disabled={!newTitle.trim() || !isTimeOrderValid || createBlockMutation.isPending}
                        className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shadow-xs shadow-primary/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Thêm vào ngày này
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}

          {/* Current Timetable for this date */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Lịch trình của ngày ({blocks.length} hoạt động)
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                Đang tải thời khóa biểu...
              </div>
            ) : blocks.length === 0 ? (
              <div className="text-center py-8 px-4 border border-dashed border-border/80 rounded-2xl bg-muted/10 space-y-2">
                <Coffee className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">
                  Chưa có lịch trình cho ngày này
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocks.map((block) => {
                  const isRoutine = block.sourceType === 'ROUTINE' || (block.id && typeof block.id === 'string' && block.id.startsWith('routine-'));
                  const routineId = block.sourceRoutineId || (block.id && typeof block.id === 'string' && block.id.startsWith('routine-') ? parseInt(block.id.split('-')[1], 10) : undefined);

                  return (
                    <div
                      key={block.id}
                      className="group p-3 rounded-xl border border-border bg-card/60 flex items-center justify-between gap-3 text-xs hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="font-mono text-xs font-bold text-foreground shrink-0 bg-muted/50 px-2 py-1 rounded-md">
                          {block.startTime} – {block.endTime}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-foreground truncate flex items-center gap-2">
                            <span>{block.title}</span>
                            {isRoutine && (
                              <span className="px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-mono text-[9px] font-bold">
                                ROUTINE
                              </span>
                            )}
                            {block.sourceType === 'CUSTOM' && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[9px] font-bold">
                                LỊCH RIÊNG
                              </span>
                            )}
                          </div>
                          {block.detail && (
                            <div className="text-muted-foreground text-[11px] truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0 opacity-60" />
                              <span>{block.detail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingBlock(block)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all focus:opacity-100"
                          title="Chỉnh sửa hoạt động này"
                          aria-label="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (isRoutine && routineId) {
                              cancelRoutineMutation.mutate({
                                routineId,
                                date: dateStr,
                              });
                            } else {
                              deleteBlockMutation.mutate(block.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all focus:opacity-100"
                          title={isRoutine ? "Hủy hoạt động này cho riêng ngày hôm nay" : "Xóa hoạt động này"}
                          aria-label={isRoutine ? "Hủy ngày này" : "Xóa"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <button
            type="button"
            onClick={onOpenFullTimeline}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem toàn bộ ngày trên Day Timeline
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingBlock && (
        <EditTimeBlockModal
          isOpen={!!editingBlock}
          block={editingBlock}
          targetDate={dateStr}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
};
