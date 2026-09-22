import React, { useState } from 'react';
import { NotificationItem, NotificationPreferences } from '@/types/planner';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Check,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Volume2,
  Sliders,
  Clock,
  Inbox,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

interface NotificationsCenterViewProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onRefresh: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: number) => void;
  onDeleteAllRead?: () => void;
  preferences: NotificationPreferences;
  onUpdatePreferences: (pref: Partial<NotificationPreferences>) => void;
  onNavigate: (viewId: string) => void;
  onOpenRebalance?: () => void;
  onCreateTestNotification?: () => void;
}

// Format relative date into English grouping
function groupNotificationsByDate(items: NotificationItem[]) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const groups: { label: string; items: NotificationItem[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Earlier', items: [] },
  ];

  for (const item of items) {
    const itemDate = (item.createdAt || '').slice(0, 10);
    if (itemDate === today) {
      groups[0].items.push(item);
    } else if (itemDate === yesterday) {
      groups[1].items.push(item);
    } else {
      groups[2].items.push(item);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Just now';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Just now';
  }
}

export const NotificationsCenterView: React.FC<NotificationsCenterViewProps> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onDeleteAllRead,
  preferences,
  onUpdatePreferences,
  onNavigate,
  onOpenRebalance,
  onCreateTestNotification,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const grouped = groupNotificationsByDate(filteredNotifications);
  const readCount = notifications.length - unreadCount;

  const handleRequestBrowserPermission = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support the Web Notifications API.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      onUpdatePreferences({ browserEnabled: true });
      try {
        new Notification('Adaptive Planner', {
          body: 'Browser notifications have been enabled successfully!',
        });
      } catch {}
    } else {
      onUpdatePreferences({ browserEnabled: false });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Left Column: Notification Feed */}
      <section className="space-y-6">
        {/* Header toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="size-4.5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                Notification Center
              </h2>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? (
                  <span className="text-primary font-medium">{unreadCount} unread notification{unreadCount > 1 ? 's' : ''}</span>
                ) : (
                  'All caught up! No unread notifications'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter pills */}
            <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/60 text-xs">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  filter === 'unread'
                    ? 'bg-card text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {onCreateTestNotification && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-semibold"
                onClick={onCreateTestNotification}
                title="Create a sample notification to test announcements"
              >
                <Sparkles className="size-3.5 mr-1" />
                Send Test Alert
              </Button>
            )}

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-card/60 hover:bg-card border-border/80 font-medium"
                onClick={onMarkAllAsRead}
                title="Mark all notifications as read"
              >
                <Check className="size-3.5 mr-1" />
                Mark all as read
              </Button>
            )}

            {readCount > 0 && onDeleteAllRead && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-destructive/5 hover:bg-destructive/15 text-destructive border-destructive/30 font-medium transition-all"
                onClick={onDeleteAllRead}
                title="Clear all read notifications"
              >
                <Trash2 className="size-3.5 mr-1" />
                Clear Read ({readCount})
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {grouped.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/30 p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
              <Inbox className="size-6 opacity-60" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">No notifications yet</h4>
              {onCreateTestNotification && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    className="rounded-xl text-xs font-semibold"
                    onClick={onCreateTestNotification}
                  >
                    <Sparkles className="size-3.5 mr-1.5" />
                    Create Test Notification
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold px-1">
                {group.label}
              </p>

              <div className="space-y-2.5">
                {group.items.map((item) => {
                  const isHigh = item.priority === 'HIGH';
                  const isAi = item.type === 'REBALANCE_AVAILABLE' || item.type === 'AI_SUGGESTION';

                  return (
                    <div
                      key={item.id}
                      className={`group rounded-2xl border p-4 transition-all backdrop-blur-sm ${
                        item.isRead
                          ? 'border-border/50 bg-card/30 opacity-75'
                          : isHigh
                          ? 'border-amber-500/50 bg-amber-500/5 shadow-xs ring-1 ring-amber-500/20'
                          : 'border-primary/40 bg-card/80 shadow-xs ring-1 ring-primary/20'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Status Icon */}
                        <div
                          className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${
                            isAi
                              ? 'bg-primary/15 text-primary'
                              : isHigh
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {isAi ? (
                            <Sparkles className="size-4.5" />
                          ) : isHigh ? (
                            <AlertTriangle className="size-4.5" />
                          ) : (
                            <Bell className="size-4.5" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.type.replace(/_/g, ' ')}
                              </span>
                              {!item.isRead && (
                                <span className="size-2 rounded-full bg-primary animate-pulse" />
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          <h3
                            className={`mt-1 font-display text-sm font-bold ${
                              item.isRead ? 'text-foreground/90' : 'text-foreground'
                            }`}
                          >
                            {item.title}
                          </h3>

                          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                            {item.message}
                          </p>

                          {/* Footer Actions */}
                          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-2">
                              {item.actionType && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (item.actionType === 'VIEW_REBALANCE' || item.type === 'REBALANCE_AVAILABLE') {
                                      onOpenRebalance?.();
                                    } else {
                                      onNavigate('today');
                                    }
                                    if (!item.isRead) onMarkAsRead(item.id);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs"
                                >
                                  <span>
                                    {item.actionType === 'VIEW_REBALANCE' || item.type === 'REBALANCE_AVAILABLE'
                                      ? 'Review Rebalance Plan'
                                      : item.actionType === 'OPEN_SESSION'
                                      ? 'Open Session'
                                      : 'View Details'}
                                  </span>
                                  <ChevronRight className="size-3" />
                                </button>
                              )}

                              {!item.isRead && (
                                <button
                                  type="button"
                                  onClick={() => onMarkAsRead(item.id)}
                                  className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteNotification(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Delete notification"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Right Column: Notification Preferences */}
      <aside className="space-y-4">
        <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur-md space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
                <Sliders className="size-4" />
              </span>
              <h3 className="font-display text-sm font-bold text-foreground">
                Notification Preferences
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Stay informed on important updates without interrupting your flow state.
            </p>
          </div>

          {/* Early Reminder Setting */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>Remind before block starts</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => onUpdatePreferences({ remindMinutesBefore: mins })}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    preferences.remindMinutesBefore === mins
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-card border-border hover:border-primary/50 text-foreground'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Delivery Channels
            </p>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">In-app Toasts</p>
                <p className="text-[10px] text-muted-foreground">Show popup toasts within the app</p>
              </div>
              <Switch
                checked={preferences.inAppEnabled}
                onCheckedChange={(v) => onUpdatePreferences({ inAppEnabled: v })}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Browser Push</p>
                <p className="text-[10px] text-muted-foreground">Alerts when running in background tabs</p>
              </div>
              <Switch
                checked={preferences.browserEnabled}
                onCheckedChange={(v) => {
                  if (v) {
                    handleRequestBrowserPermission();
                  } else {
                    onUpdatePreferences({ browserEnabled: false });
                  }
                }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Gentle Chime</p>
                <p className="text-[10px] text-muted-foreground">Soft 432Hz ambient audio chime</p>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(v) => onUpdatePreferences({ soundEnabled: v })}
              />
            </div>
          </div>

          {/* Focus Protection Rules */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-500" />
              <span>Focus Protection</span>
            </p>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Do Not Disturb in Deep Work</p>
                <p className="text-[10px] text-muted-foreground">Only deliver high-priority urgent alerts</p>
              </div>
              <Switch
                checked={preferences.suppressDuringFocus}
                onCheckedChange={(v) => onUpdatePreferences({ suppressDuringFocus: v })}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Mute during Breaks & Sleep</p>
                <p className="text-[10px] text-muted-foreground">Keep quiet during recovery intervals</p>
              </div>
              <Switch
                checked={preferences.suppressDuringSleep}
                onCheckedChange={(v) => onUpdatePreferences({ suppressDuringSleep: v })}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
