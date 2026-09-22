import React, { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Calendar,
  BookmarkCheck,
  Check,
  X,
  ArrowRight,
  Shield,
  Layers,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWeeklyInsights, useProgressiveInsights, useSaveExperimentMutation, useDismissExperimentMutation } from './hooks';
import { ThisWeekProgressCard } from './components/ThisWeekProgressCard';
import { LastWeekReflectionCard } from './components/LastWeekReflectionCard';
import { FirstUseTip } from '@/components/adaptive/guidance/FirstUseTip';

interface InsightsViewProps {
  onNavigateToWeek?: (weekStart: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = () => {
  const [currentWeekMonday, setCurrentWeekMonday] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [expandedPatterns, setExpandedPatterns] = useState<Record<string, boolean>>({});
  const [previewSuggestionId, setPreviewSuggestionId] = useState<string | null>(null);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  const formattedWeekStart = format(currentWeekMonday, 'yyyy-MM-dd');
  const isCurrentWeek = isSameWeek(currentWeekMonday, new Date(), { weekStartsOn: 1 });

  const { data: progressiveData, isLoading: isProgressiveLoading, error: progressiveError, refetch: refetchProgressive } =
    useProgressiveInsights(formattedWeekStart);
  const { data: insights, isLoading: isWeeklyLoading } = useWeeklyInsights(formattedWeekStart);

  const saveExperimentMutation = useSaveExperimentMutation();
  const dismissExperimentMutation = useDismissExperimentMutation();

  const handlePrevWeek = () => {
    setCurrentWeekMonday((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    if (!isCurrentWeek) {
      setCurrentWeekMonday((prev) => addWeeks(prev, 1));
    }
  };

  const togglePatternExpand = (ruleKey: string) => {
    setExpandedPatterns((prev) => ({ ...prev, [ruleKey]: !prev[ruleKey] }));
  };

  const handleSaveExperiment = (ruleKey: string, evidenceFingerprint: string) => {
    saveExperimentMutation.mutate({
      sourceWeek: formattedWeekStart,
      ruleKey,
      evidenceFingerprint,
    });
  };

  const handleApplySuggestion = (suggestionId: string) => {
    setPreviewSuggestionId(suggestionId);
  };

  const handleConfirmApplySuggestion = () => {
    setPreviewSuggestionId(null);
    setAppliedToast('Đã áp dụng mẫu hình bảo vệ khung giờ tập trung buổi sáng vào lịch trình!');
    setTimeout(() => {
      setAppliedToast(null);
    }, 6000);
  };

  const isLoading = isProgressiveLoading || isWeeklyLoading;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Contextual First-Use Guidance */}
      <FirstUseTip
        tipId="insights"
        icon={<Lightbulb className="size-4 text-teal-600 dark:text-teal-400" />}
        title="Patterns, not grades."
        description="Modo looks for patterns that may help you plan future days."
        actionLabel="Got it"
      />

      {/* Toast notification */}
      {appliedToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-foreground text-background shadow-2xl flex items-center gap-3 border border-border animate-in slide-in-from-bottom-5 duration-300">
          <div className="size-6 rounded-full bg-emerald-500 text-white grid place-items-center flex-shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">{appliedToast}</span>
          <button
            onClick={() => setAppliedToast(null)}
            className="text-xs opacity-70 hover:opacity-100 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Week Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5 rounded-3xl border border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Lightbulb className="size-4" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Insights & Nhịp điệu cá nhân
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Your patterns, not your performance · Nhận diện nhịp điệu thực tế để nâng đỡ lịch trình mà không tạo áp lực.
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-muted/40 p-1.5 rounded-2xl border border-border/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevWeek}
            className="size-8 rounded-xl hover:bg-background"
            title="Tuần trước"
          >
            <ChevronLeft className="size-4" />
          </Button>

          <div className="px-3 text-center">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-foreground">
              <Calendar className="size-3.5 text-primary" />
              <span>
                {format(currentWeekMonday, 'dd/MM', { locale: vi })} –{' '}
                {format(addWeeks(currentWeekMonday, 1), 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">
              {isCurrentWeek ? 'Tuần đang diễn ra' : 'Tuần đã lưu'}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            disabled={isCurrentWeek}
            className="size-8 rounded-xl hover:bg-background disabled:opacity-40"
            title="Tuần kế tiếp"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-3">
          <RefreshCw className="size-8 animate-spin text-primary mx-auto opacity-75" />
          <p className="text-sm font-medium text-foreground">Đang tổng hợp nhịp điệu sinh hoạt từ lịch trình...</p>
          <p className="text-xs text-muted-foreground">Theo dõi trực tiếp và minh bạch từng ngày.</p>
        </div>
      )}

      {/* Error State */}
      {progressiveError && !isLoading && (
        <div className="glass-panel rounded-3xl p-8 border-destructive/30 bg-destructive/5 text-center space-y-3">
          <AlertCircle className="size-8 text-destructive mx-auto" />
          <h3 className="font-bold text-sm text-foreground">Không thể tải nhịp điệu tuần này</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {(progressiveError as Error)?.message || 'Đã xảy ra lỗi khi kết nối tới máy chủ phân tích.'}
          </p>
          <Button onClick={() => refetchProgressive()} size="sm" variant="outline" className="rounded-xl gap-1.5 text-xs">
            <RefreshCw className="size-3" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Progressive Insights Ready */}
      {progressiveData && !isLoading && (
        <div className="space-y-6">
          {/* TIER 1: This Week Live Flow */}
          <ThisWeekProgressCard currentWeek={progressiveData.currentWeek} />

          {/* TIER 2: Last Week Reflection & Learning */}
          <LastWeekReflectionCard
            lastWeek={progressiveData.lastWeek}
            onApplySuggestion={handleApplySuggestion}
          />

          {/* Additional Confirmed Weekly Patterns & Experiments (if available) */}
          {insights && insights.patterns && insights.patterns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span>Mẫu hình thói quen định kỳ khác</span>
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                {insights.patterns.map((pat) => {
                  const isExpanded = !!expandedPatterns[pat.ruleKey];
                  return (
                    <div
                      key={pat.ruleKey}
                      className="glass-panel p-5 rounded-3xl border border-border/60 space-y-3 transition-all hover:border-primary/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                            {pat.confidence} CONFIDENCE · {pat.sampleSize} mẫu
                          </span>
                          <h4 className="font-bold text-sm text-foreground mt-2">{pat.title}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pat.observation}</p>

                      {pat.evidence && pat.evidence.length > 0 && (
                        <div className="pt-2 border-t border-border/40">
                          <button
                            type="button"
                            onClick={() => togglePatternExpand(pat.ruleKey)}
                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Ẩn bằng chứng' : `Xem ${pat.evidence.length} bằng chứng thực`}</span>
                          </button>

                          {isExpanded && (
                            <ul className="mt-2 space-y-1.5 text-[11px] font-mono text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/40">
                              {pat.evidence.map((ev, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 truncate">
                                  <span className="text-primary font-bold">•</span>
                                  <span className="font-bold text-foreground">{ev.date}:</span>
                                  <span className="truncate">{ev.label}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations / Experiments */}
          {insights && insights.recommendations && insights.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <BookmarkCheck className="size-4 text-emerald-500" />
                <span>Thử nghiệm nhỏ cho tuần tới</span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {insights.recommendations.map((rec) => {
                  const isSaved = insights.experimentState?.ruleKey === rec.ruleKey;

                  return (
                    <div
                      key={rec.ruleKey}
                      className={`glass-panel p-5 rounded-3xl border transition-all space-y-3 flex flex-col justify-between ${
                        isSaved ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-border/60 hover:border-primary/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            {rec.ruleKey}
                          </span>
                          {isSaved && (
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="size-3" />
                              Đã lưu thử nghiệm
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-foreground">{rec.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rec.rationale}</p>
                        <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 text-xs text-foreground font-medium">
                          {rec.measurableAction}
                        </div>
                      </div>

                      <div className="pt-2">
                        {isSaved ? (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            <span>Nhắc nhở vào 09:00 Thứ Hai ({insights.experimentState?.reminderDate})</span>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleSaveExperiment(rec.ruleKey, rec.evidenceFingerprint)}
                            disabled={saveExperimentMutation.isPending}
                            size="sm"
                            className="w-full rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm"
                          >
                            <BookmarkCheck className="size-3.5 mr-1.5" />
                            Thử vào tuần tới
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestion Diff Preview Modal */}
      {previewSuggestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Xem trước đề xuất lịch trình</h3>
                  <p className="text-xs text-muted-foreground">Bảo vệ 1 khung giờ tập trung buổi sáng</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewSuggestionId(null)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                Dựa trên dữ liệu tuần trước cho thấy bạn tập trung tốt nhất trước 12h, Modo đề xuất tạo một khối <strong>Deep Work</strong> cố định:
              </p>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2 font-mono">
                <div className="flex items-center justify-between text-[11px] text-foreground font-semibold">
                  <span>Khung giờ: 09:00 – 10:30 (90 phút)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                    + Mới
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Phân bổ: Thứ Hai, Thứ Ba, Thứ Tư, Thứ Năm, Thứ Sáu
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Trạng thái bảo vệ: 🛡️ Protected Buffer (không bị chèn lịch khẩn)
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewSuggestionId(null)}
                className="rounded-xl text-xs"
              >
                Đóng
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmApplySuggestion}
                className="rounded-xl text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="size-3.5" />
                Xác nhận áp dụng đề xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
