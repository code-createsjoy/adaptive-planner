import React, { useState, useMemo } from 'react';
import { usePlannerStore } from '@/store/usePlannerStore';
import {
  useRoutinesQuery,
  useCreateRoutineMutation,
  useUpdateRoutineMutation,
  useToggleRoutineMutation,
  useDeleteRoutineMutation,
  useCopyDayRoutinesMutation,
  useCopyRoutineToDaysMutation,
} from '@/hooks/useTimeBlocks';
import { DayOfWeekType, BlockCategory, EnergyLevel, WeeklyRoutine } from '@/types/planner';
import {
  X,
  Plus,
  Trash2,
  Check,
  Calendar,
  Copy,
  AlertTriangle,
  Layers,
  AlertCircle,
  Pencil,
  Clock,
} from 'lucide-react';

const DAYS_OF_WEEK: { id: DayOfWeekType; label: string; short: string }[] = [
  { id: 'MONDAY', label: 'Monday', short: 'Mon' },
  { id: 'TUESDAY', label: 'Tuesday', short: 'Tue' },
  { id: 'WEDNESDAY', label: 'Wednesday', short: 'Wed' },
  { id: 'THURSDAY', label: 'Thursday', short: 'Thu' },
  { id: 'FRIDAY', label: 'Friday', short: 'Fri' },
  { id: 'SATURDAY', label: 'Saturday', short: 'Sat' },
  { id: 'SUNDAY', label: 'Sunday', short: 'Sun' },
];

function timeToMinutes(timeStr: string): number {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  } catch {
    return 0;
  }
}

export const WeeklyRoutineModal: React.FC = () => {
  const isRoutineModalOpen = usePlannerStore((state) => state.isRoutineModalOpen);
  const setIsRoutineModalOpen = usePlannerStore((state) => state.setIsRoutineModalOpen);

  const { data: routines = [] } = useRoutinesQuery();
  const createRoutineMutation = useCreateRoutineMutation();
  const updateRoutineMutation = useUpdateRoutineMutation();
  const toggleRoutineMutation = useToggleRoutineMutation();
  const deleteRoutineMutation = useDeleteRoutineMutation();
  const copyDayMutation = useCopyDayRoutinesMutation();
  const copyRoutineToDaysMutation = useCopyRoutineToDaysMutation();

  // Form state
  const [selectedDays, setSelectedDays] = useState<DayOfWeekType[]>([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
  ]);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [category, setCategory] = useState<BlockCategory>('work');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('high');
  const [priority, setPriority] = useState<string>('Normal');

  // Edit Routine Modal state
  const [editingRoutine, setEditingRoutine] = useState<WeeklyRoutine | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDetail, setEditDetail] = useState('');
  const [editStartTime, setEditStartTime] = useState('08:00');
  const [editEndTime, setEditEndTime] = useState('17:00');
  const [editCategory, setEditCategory] = useState<BlockCategory>('work');
  const [editEnergyLevel, setEditEnergyLevel] = useState<EnergyLevel>('high');
  const [editScope, setEditScope] = useState<'SINGLE' | 'ALL_MATCHING'>('SINGLE');

  // Copy dropdown modals state
  const [copyingTargetDay, setCopyingTargetDay] = useState<DayOfWeekType | null>(null);
  const [selectedSourceDay, setSelectedSourceDay] = useState<DayOfWeekType>('FRIDAY');
  const [copyTaskTargetModal, setCopyTaskTargetModal] = useState<WeeklyRoutine | null>(null);
  const [taskTargetDays, setTaskTargetDays] = useState<DayOfWeekType[]>(['SATURDAY']);

  // Validation
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const isTimeOrderValid = endMinutes > startMinutes;

  const editStartMinutes = timeToMinutes(editStartTime);
  const editEndMinutes = timeToMinutes(editEndTime);
  const isEditTimeOrderValid = editEndMinutes > editStartMinutes;

  // Exact duplicate detection: Only triggers when adding the exact same task title and time slot to a day
  const exactDuplicates = useMemo(() => {
    if (!isTimeOrderValid || selectedDays.length === 0 || !title.trim()) return [];
    const normalizedTitle = title.trim().toLowerCase();
    const duplicates: { day: DayOfWeekType; dayLabel: string; title: string; time: string }[] = [];

    for (const day of selectedDays) {
      const dayRoutines = routines.filter((r) => r.dayOfWeek === day);
      const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label || day;

      for (const r of dayRoutines) {
        if (
          r.startTime === startTime &&
          r.endTime === endTime &&
          r.title.trim().toLowerCase() === normalizedTitle
        ) {
          duplicates.push({
            day,
            dayLabel,
            title: r.title,
            time: `${r.startTime} – ${r.endTime}`,
          });
        }
      }
    }
    return duplicates;
  }, [selectedDays, startTime, endTime, title, routines, isTimeOrderValid]);

  // Duplicates preview when copying day
  const copyDayDuplicates = useMemo(() => {
    if (!copyingTargetDay) return [];
    const sourceRoutines = routines.filter((r) => r.dayOfWeek === selectedSourceDay);
    const targetRoutines = routines.filter((r) => r.dayOfWeek === copyingTargetDay);
    const duplicates: string[] = [];

    for (const src of sourceRoutines) {
      for (const tgt of targetRoutines) {
        if (
          src.startTime === tgt.startTime &&
          src.endTime === tgt.endTime &&
          src.title.trim().toLowerCase() === tgt.title.trim().toLowerCase()
        ) {
          duplicates.push(`"${src.title}" (${src.startTime}–${src.endTime})`);
        }
      }
    }
    return duplicates;
  }, [copyingTargetDay, selectedSourceDay, routines]);

  // Duplicates preview when copying a single task to target days
  const copyTaskDuplicates = useMemo(() => {
    if (!copyTaskTargetModal || taskTargetDays.length === 0) return [];
    const duplicates: { dayLabel: string; title: string }[] = [];

    for (const day of taskTargetDays) {
      const dayRoutines = routines.filter((r) => r.dayOfWeek === day);
      const dayLabel = DAYS_OF_WEEK.find((d) => d.id === day)?.label || day;

      for (const r of dayRoutines) {
        if (
          r.startTime === copyTaskTargetModal.startTime &&
          r.endTime === copyTaskTargetModal.endTime &&
          r.title.trim().toLowerCase() === copyTaskTargetModal.title.trim().toLowerCase()
        ) {
          duplicates.push({
            dayLabel,
            title: `"${r.title}" (${r.startTime}–${r.endTime})`,
          });
        }
      }
    }
    return duplicates;
  }, [copyTaskTargetModal, taskTargetDays, routines]);

  // Matching days for currently edited routine
  const matchingDaysForEdit = useMemo(() => {
    if (!editingRoutine) return [];
    return routines.filter(
      (r) => r.title.trim().toLowerCase() === editingRoutine.title.trim().toLowerCase()
    );
  }, [editingRoutine, routines]);

  const matchingDayLabels = useMemo(() => {
    return matchingDaysForEdit.map(
      (r) => DAYS_OF_WEEK.find((d) => d.id === r.dayOfWeek)?.label || r.dayOfWeek
    );
  }, [matchingDaysForEdit]);

  if (!isRoutineModalOpen) return null;

  const handleDayToggle = (day: DayOfWeekType) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSelectWeekdays = () => {
    setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);
  };

  const handleSelectAll = () => {
    setSelectedDays(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']);
  };

  const handleAddRoutine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDays.length === 0 || !isTimeOrderValid) return;

    createRoutineMutation.mutate({
      daysOfWeek: selectedDays,
      title: title.trim(),
      detail: detail.trim(),
      startTime,
      endTime,
      category,
      energyLevel,
      priority,
      reminderMinutesBefore: [30, 10, 0],
    });

    setTitle('');
    setDetail('');
  };

  const handleAddPreset = (preset: {
    days: DayOfWeekType[];
    title: string;
    detail: string;
    startTime: string;
    endTime: string;
    category: BlockCategory;
    energyLevel: EnergyLevel;
  }) => {
    createRoutineMutation.mutate({
      daysOfWeek: preset.days,
      title: preset.title,
      detail: preset.detail,
      startTime: preset.startTime,
      endTime: preset.endTime,
      category: preset.category,
      energyLevel: preset.energyLevel,
      priority: 'Normal',
      reminderMinutesBefore: [15, 0],
    });
  };

  const handleOpenEdit = (routine: WeeklyRoutine) => {
    setEditingRoutine(routine);
    setEditTitle(routine.title);
    setEditDetail(routine.detail || '');
    setEditStartTime(routine.startTime);
    setEditEndTime(routine.endTime);
    setEditCategory(routine.category || 'work');
    setEditEnergyLevel(routine.energyLevel || 'medium');
    setEditScope('SINGLE');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoutine || !editTitle.trim() || !isEditTimeOrderValid) return;

    updateRoutineMutation.mutate({
      id: editingRoutine.id,
      updates: {
        title: editTitle.trim(),
        detail: editDetail.trim(),
        startTime: editStartTime,
        endTime: editEndTime,
        category: editCategory,
        energyLevel: editEnergyLevel,
      },
      updateAllMatching: editScope === 'ALL_MATCHING',
    });

    setEditingRoutine(null);
  };

  const handleExecuteCopyDay = (targetDay: DayOfWeekType) => {
    if (selectedSourceDay === targetDay) return;
    copyDayMutation.mutate({
      fromDay: selectedSourceDay,
      toDays: [targetDay],
      overwrite: false,
    });
    setCopyingTargetDay(null);
  };

  const handleExecuteCopyTask = () => {
    if (!copyTaskTargetModal || taskTargetDays.length === 0) return;
    copyRoutineToDaysMutation.mutate({
      routineId: copyTaskTargetModal.id,
      targetDays: taskTargetDays,
    });
    setCopyTaskTargetModal(null);
  };

  // Helper to find exact duplicates within a day's existing routines
  const getDuplicateRoutine = (routine: WeeklyRoutine, allDayRoutines: WeeklyRoutine[]) => {
    return allDayRoutines.find(
      (other) =>
        other.id !== routine.id &&
        other.startTime === routine.startTime &&
        other.endTime === routine.endTime &&
        other.title.trim().toLowerCase() === routine.title.trim().toLowerCase()
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Weekly Routines
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsRoutineModalOpen(false)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              ⚡ Routine Templates
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleAddPreset({
                    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
                    title: '💼 Core Work & Focus',
                    detail: 'Focus coding & task execution',
                    startTime: '08:30',
                    endTime: '17:00',
                    category: 'work',
                    energyLevel: 'high',
                  })
                }
                className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="font-bold text-foreground group-hover:text-primary">Mon–Fri: Core Work</div>
                  <div className="text-muted-foreground text-[11px]">08:30 – 17:00 · Work & Focus</div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddPreset({
                    days: ['TUESDAY', 'THURSDAY'],
                    title: '💪 Gym & Fitness',
                    detail: 'Cardio & Strength workout',
                    startTime: '17:30',
                    endTime: '18:30',
                    category: 'health',
                    energyLevel: 'medium',
                  })
                }
                className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="font-bold text-foreground group-hover:text-primary">Tue, Thu: Gym Workout</div>
                  <div className="text-muted-foreground text-[11px]">17:30 – 18:30 · Health & Movement</div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddPreset({
                    days: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
                    title: '📚 Evening Study & Research',
                    detail: 'Algorithms & software design',
                    startTime: '19:30',
                    endTime: '21:30',
                    category: 'work',
                    energyLevel: 'high',
                  })
                }
                className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="font-bold text-foreground group-hover:text-primary">Mon–Fri: Evening Study</div>
                  <div className="text-muted-foreground text-[11px]">19:30 – 21:30 · Study & Skill</div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddPreset({
                    days: ['SATURDAY'],
                    title: '🎨 Side Project & Creative Focus',
                    detail: 'Creative passion projects',
                    startTime: '09:00',
                    endTime: '12:00',
                    category: 'work',
                    energyLevel: 'medium',
                  })
                }
                className="p-3 rounded-xl border border-border/80 bg-muted/20 hover:bg-primary/5 hover:border-primary/40 text-left text-xs transition-all flex items-start justify-between group"
              >
                <div>
                  <div className="font-bold text-foreground group-hover:text-primary">Sat: Side Project</div>
                  <div className="text-muted-foreground text-[11px]">09:00 – 12:00 · Creative Focus</div>
                </div>
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              </button>
            </div>
          </div>

          {/* Add New Custom Routine Form */}
          <form onSubmit={handleAddRoutine} className="bg-card border border-border/80 rounded-xl p-4 space-y-4">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary" />
              Create Custom Recurring Timeblock
            </span>

            {/* Days Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Select days to apply:</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectWeekdays}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Weekdays (Mon-Fri)
                  </button>
                  <span className="text-muted-foreground/40">·</span>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Everyday
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => handleDayToggle(day.id)}
                      className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                        isChecked
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 💼 Deep Work, Gym Workout, Study English..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Details (Optional)</label>
                <input
                  type="text"
                  placeholder="Additional notes..."
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Time & Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 ${
                    !isTimeOrderValid ? 'border-destructive text-destructive focus:ring-destructive/20' : 'border-border focus:ring-primary/20'
                  }`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BlockCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="work">Work & Focus</option>
                  <option value="health">Health & Fitness</option>
                  <option value="rest">Rest & Recovery</option>
                  <option value="social">Social & Outing</option>
                  <option value="transition">Buffer & Commute</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Energy Level</label>
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
            </div>

            {/* Time Order Error */}
            {!isTimeOrderValid && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>End time ({endTime}) must be after start time ({startTime}). Please adjust times.</span>
              </div>
            )}

            {/* Exact Duplicate Warning */}
            {isTimeOrderValid && exactDuplicates.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs space-y-1.5 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Duplicate activity detected: This routine is already scheduled for the day!</span>
                </div>
                <div className="space-y-1 pl-6">
                  {exactDuplicates.map((dup, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 font-bold">{dup.dayLabel}</span>
                      <span>
                        Already has <b>"{dup.title}"</b> ({dup.time}). No need to add again.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={!title.trim() || !isTimeOrderValid || exactDuplicates.length === selectedDays.length || createRoutineMutation.isPending}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Save to Weekly Routines
              </button>
            </div>
          </form>

          {/* Current Routines List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Weekly Routines ({routines.length} timeblocks)
              </span>
              <span className="text-[11px] text-muted-foreground italic">
                💡 Click any timeblock to edit (single day or all matching days)
              </span>
            </div>

            {routines.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-border/80 rounded-xl bg-muted/10 text-muted-foreground text-xs">
                No recurring routines yet. Choose a quick template above or create your own!
              </div>
            ) : (
              <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => {
                  const dayRoutines = routines.filter((r) => r.dayOfWeek === day.id);
                  const isCopying = copyingTargetDay === day.id;

                  return (
                    <div key={day.id} className="border border-border/60 rounded-xl p-3 bg-muted/10">
                      {/* Day Header with Copy Action */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">
                            {day.label}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            ({dayRoutines.length} timeblocks)
                          </span>
                        </div>

                        {/* Copy From Another Day Button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCopyingTargetDay(isCopying ? null : day.id)}
                            className="text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copy from another day...
                          </button>

                          {/* Dropdown to pick source day */}
                          {isCopying && (
                            <div className="absolute right-0 top-full mt-1 z-30 w-72 bg-card border border-border rounded-xl shadow-xl p-3 space-y-2.5 animate-in fade-in zoom-in-95">
                              <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                                <span className="text-xs font-bold text-foreground">
                                  Copy to {day.label}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setCopyingTargetDay(null)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                Select a source day to copy all routines to {day.label}:
                              </p>
                              <select
                                value={selectedSourceDay}
                                onChange={(e) => setSelectedSourceDay(e.target.value as DayOfWeekType)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-medium"
                              >
                                {DAYS_OF_WEEK.filter((d) => d.id !== day.id).map((d) => {
                                  const count = routines.filter((r) => r.dayOfWeek === d.id).length;
                                  return (
                                    <option key={d.id} value={d.id}>
                                      {d.label} ({count} timeblocks)
                                    </option>
                                  );
                                })}
                              </select>

                              {/* Copy duplicates preview */}
                              {copyDayDuplicates.length > 0 && (
                                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300 space-y-1">
                                  <div className="font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Already exists (duplicates will be skipped):
                                  </div>
                                  {copyDayDuplicates.map((msg, i) => (
                                    <div key={i} className="text-[10px] pl-3">• {msg}</div>
                                  ))}
                                </div>
                              )}

                              <div className="flex justify-end gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setCopyingTargetDay(null)}
                                  className="px-2 py-1 text-xs text-muted-foreground hover:bg-muted rounded-md"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExecuteCopyDay(day.id)}
                                  className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary/90 flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" />
                                  Copy Now
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Routines list for this day */}
                      {dayRoutines.length === 0 ? (
                        <p className="text-xs text-muted-foreground/60 italic py-2 pl-1">
                          No routines for {day.label} yet. You can click "Copy from another day..." or create new routines.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {dayRoutines.map((routine) => {
                            const duplicateRoutine = getDuplicateRoutine(routine, dayRoutines);
                            const isDuplicate = !!duplicateRoutine;

                            return (
                              <div
                                key={routine.id}
                                className={`p-2.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 text-xs transition-all ${
                                  isDuplicate
                                    ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20'
                                    : routine.enabled
                                    ? 'bg-card border-border/80 hover:border-primary/50'
                                    : 'bg-muted/30 border-dashed border-border/40 opacity-60'
                                }`}
                              >
                                {/* Routine item details - Clickable to edit */}
                                <div
                                  onClick={() => handleOpenEdit(routine)}
                                  className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
                                  title="Click to edit this timeblock"
                                >
                                  <span className="font-mono text-xs font-semibold text-foreground/90 shrink-0 group-hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                                    {routine.startTime} – {routine.endTime}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-semibold text-foreground truncate flex items-center gap-2 group-hover:text-primary transition-colors">
                                      <span>{routine.title}</span>
                                      <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 text-muted-foreground transition-opacity" />
                                      {isDuplicate && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                                          <AlertTriangle className="w-3 h-3" />
                                          Duplicate
                                        </span>
                                      )}
                                    </div>
                                    {routine.detail && (
                                      <div className="text-muted-foreground text-[11px] truncate">{routine.detail}</div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-1.5 shrink-0">
                                  {/* Edit button */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEdit(routine)}
                                    className="px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                                    title="Edit timeblock"
                                  >
                                    <Pencil className="w-3 h-3" />
                                    Edit
                                  </button>

                                  {/* Copy single task to other days */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCopyTaskTargetModal(routine);
                                      setTaskTargetDays(
                                        DAYS_OF_WEEK.filter((d) => d.id !== routine.dayOfWeek).map((d) => d.id)
                                      );
                                    }}
                                    className="px-2 py-1 rounded-md text-[10px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1"
                                    title="Apply this routine to other days..."
                                  >
                                    <Layers className="w-3 h-3" />
                                    Add to other days
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleRoutineMutation.mutate(routine.id)}
                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                                      routine.enabled
                                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                  >
                                    {routine.enabled ? 'Active' : 'Paused'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => deleteRoutineMutation.mutate(routine.id)}
                                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal: Edit Time Slot for 1 Day or All Matching Days */}
        {editingRoutine && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/60 backdrop-blur-xs">
            <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Edit Recurring Timeblock
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Editing for: <b>{DAYS_OF_WEEK.find((d) => d.id === editingRoutine.dayOfWeek)?.label}</b> · {editingRoutine.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRoutine(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* Scope selector */}
                <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                  <span className="text-xs font-bold text-foreground block">
                    Update Scope:
                  </span>
                  <div className="space-y-1.5">
                    <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-primary/10">
                      <input
                        type="radio"
                        name="editScope"
                        checked={editScope === 'SINGLE'}
                        onChange={() => setEditScope('SINGLE')}
                        className="mt-0.5 text-primary focus:ring-primary"
                      />
                      <div>
                        <span className="font-semibold">
                          Apply only to {DAYS_OF_WEEK.find((d) => d.id === editingRoutine.dayOfWeek)?.label}
                        </span>
                        <p className="text-[11px] text-muted-foreground">
                          Only updates this timeblock on {DAYS_OF_WEEK.find((d) => d.id === editingRoutine.dayOfWeek)?.label}. Other days remain unchanged.
                        </p>
                      </div>
                    </label>

                    {matchingDaysForEdit.length > 1 && (
                      <label className="flex items-start gap-2.5 text-xs text-foreground cursor-pointer p-1.5 rounded-lg hover:bg-primary/10">
                        <input
                          type="radio"
                          name="editScope"
                          checked={editScope === 'ALL_MATCHING'}
                          onChange={() => setEditScope('ALL_MATCHING')}
                          className="mt-0.5 text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="font-semibold text-primary">
                            Apply to ALL days with "{editingRoutine.title}" ({matchingDayLabels.join(', ')})
                          </span>
                          <p className="text-[11px] text-muted-foreground">
                            Sync these changes across all {matchingDaysForEdit.length} days with this activity title.
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Title & Detail inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Activity Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Detail (Notes)
                    </label>
                    <input
                      type="text"
                      value={editDetail}
                      onChange={(e) => setEditDetail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Time inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 ${
                        !isEditTimeOrderValid
                          ? 'border-destructive text-destructive focus:ring-destructive/20'
                          : 'border-border focus:ring-primary/20'
                      }`}
                    />
                  </div>
                </div>

                {/* Category & Energy */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Category
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as BlockCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="work">Work & Focus</option>
                      <option value="health">Health & Fitness</option>
                      <option value="rest">Rest & Recovery</option>
                      <option value="social">Social & Outing</option>
                      <option value="transition">Buffer & Commute</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Energy Level
                    </label>
                    <select
                      value={editEnergyLevel}
                      onChange={(e) => setEditEnergyLevel(e.target.value as EnergyLevel)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="high">⚡ High Energy</option>
                      <option value="medium">🔋 Medium Energy</option>
                      <option value="low">🌱 Low Energy</option>
                    </select>
                  </div>
                </div>

                {!isEditTimeOrderValid && (
                  <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>End time ({editEndTime}) must be after start time ({editStartTime}).</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => setEditingRoutine(null)}
                    className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editTitle.trim() || !isEditTimeOrderValid || updateRoutineMutation.isPending}
                    className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shadow-xs shadow-primary/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal copy single routine to other days */}
        {copyTaskTargetModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/60 backdrop-blur-xs">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/80 pb-2">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Apply to Other Days
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    Task: "{copyTaskTargetModal.title}" ({copyTaskTargetModal.startTime} - {copyTaskTargetModal.endTime})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCopyTaskTargetModal(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  Select days to apply this routine to:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isOrigin = day.id === copyTaskTargetModal.dayOfWeek;
                    const isChecked = taskTargetDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        disabled={isOrigin}
                        onClick={() => {
                          if (isChecked) {
                            setTaskTargetDays(taskTargetDays.filter((d) => d !== day.id));
                          } else {
                            setTaskTargetDays([...taskTargetDays, day.id]);
                          }
                        }}
                        className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                          isOrigin
                            ? 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
                            : isChecked
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'bg-muted/40 text-muted-foreground hover:bg-muted'
                        }`}
                        title={isOrigin ? 'Origin day' : undefined}
                      >
                        {day.short}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task copy duplicate warning */}
              {copyTaskDuplicates.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Already exists on target day (will skip duplicate):
                  </div>
                  {copyTaskDuplicates.map((c, i) => (
                    <div key={i} className="text-[11px] pl-4">
                      • <b>{c.dayLabel}</b>: Already has {c.title}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setCopyTaskTargetModal(null)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteCopyTask}
                  disabled={taskTargetDays.length === 0}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shadow-xs shadow-primary/20"
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-muted/20">
          <button
            onClick={() => setIsRoutineModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all"
          >
            Close & Apply
          </button>
        </div>
      </div>
    </div>
  );
};
