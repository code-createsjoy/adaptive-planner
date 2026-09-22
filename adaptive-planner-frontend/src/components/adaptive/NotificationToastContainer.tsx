import React from 'react';
import { InAppToast } from '@/hooks/useNotificationScheduler';
import { Bell, Sparkles, AlertTriangle, CheckCircle2, X, ChevronRight } from 'lucide-react';

interface NotificationToastContainerProps {
  toasts: InAppToast[];
  onDismiss: (id: string) => void;
}

export const NotificationToastContainer: React.FC<NotificationToastContainerProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isHigh = toast.priority === 'HIGH';
        const isRebalance = toast.type === 'REBALANCE_AVAILABLE' || toast.type === 'AI_SUGGESTION';

        const icon = isRebalance ? (
          <Sparkles className="size-4 text-primary" />
        ) : isHigh ? (
          <AlertTriangle className="size-4 text-amber-500" />
        ) : (
          <Bell className="size-4 text-primary" />
        );

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border p-4 shadow-xl backdrop-blur-xl transition-all animate-in slide-in-from-bottom-5 fade-in ${
              isHigh
                ? 'bg-card/95 border-amber-500/40 ring-1 ring-amber-500/30'
                : 'bg-card/95 border-primary/30 ring-1 ring-primary/20'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${
                  isHigh ? 'bg-amber-500/15' : 'bg-primary/10'
                }`}
              >
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {toast.type.replace(/_/g, ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDismiss(toast.id)}
                    className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <h4 className="font-display text-sm font-bold text-foreground mt-0.5 truncate">
                  {toast.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>

                {toast.actionLabel && (
                  <div className="mt-3 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        toast.onAction?.();
                        onDismiss(toast.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                    >
                      <span>{toast.actionLabel}</span>
                      <ChevronRight className="size-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
