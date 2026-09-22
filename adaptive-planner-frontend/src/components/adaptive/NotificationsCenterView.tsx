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

// Format relative date into Vietnamese grouping
function groupNotificationsByDate(items: NotificationItem[]) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const groups: { label: string; items: NotificationItem[] }[] = [
    { label: 'Hôm nay', items: [] },
    { label: 'Hôm qua', items: [] },
    { label: 'Trước đó', items: [] },
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
  if (!dateStr) return 'Vừa xong';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  } catch {
    return 'Vừa xong';
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
      alert('Trình duyệt của bạn không hỗ trợ Web Notifications API.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      onUpdatePreferences({ browserEnabled: true });
      try {
        new Notification('Adaptive Planner', {
          body: 'Thông báo trên trình duyệt đã được bật thành công!',
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
                Trung tâm thông báo
              </h2>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? (
                  <span className="text-primary font-medium">{unreadCount} thông báo chưa đọc</span>
                ) : (
                  'Bạn đã xem hết mọi thông báo'
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
                Tất cả ({notifications.length})
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
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {onCreateTestNotification && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/30 font-semibold"
                onClick={onCreateTestNotification}
                title="Tạo một thông báo mẫu để kiểm tra hoạt động"
              >
                <Sparkles className="size-3.5 mr-1" />
                Gửi thông báo mẫu
              </Button>
            )}

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-card/60 hover:bg-card border-border/80 font-medium"
                onClick={onMarkAllAsRead}
                title="Đánh dấu tất cả thông báo là đã đọc"
              >
                <Check className="size-3.5 mr-1" />
                Đọc tất cả
              </Button>
            )}

            {readCount > 0 && onDeleteAllRead && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs bg-destructive/5 hover:bg-destructive/15 text-destructive border-destructive/30 font-medium transition-all"
                onClick={onDeleteAllRead}
                title="Xóa tất cả các thông báo đã đọc"
              >
                <Trash2 className="size-3.5 mr-1" />
                Xóa đã đọc ({readCount})
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
              <h4 className="text-sm font-bold text-foreground">Không có thông báo nào</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto leading-relaxed">
                Mọi nhắc nhở ca làm việc, cảnh báo tiến độ dự án và gợi ý từ AI sẽ xuất hiện tại đây khi phát sinh.
              </p>
              {onCreateTestNotification && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    className="rounded-xl text-xs font-semibold"
                    onClick={onCreateTestNotification}
                  >
                    <Sparkles className="size-3.5 mr-1.5" />
                    Tạo thông báo thử nghiệm
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
                                      ? 'Xem phương án cân đối'
                                      : item.actionType === 'OPEN_SESSION'
                                      ? 'Xem ca làm việc'
                                      : 'Xem chi tiết'}
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
                                  Đánh dấu đã đọc
                                </button>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteNotification(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                              title="Xóa thông báo"
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
                Tùy chỉnh thông báo
              </h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Kiểm soát các cập nhật quan trọng mà không làm đứt đoạn sự tập trung.
            </p>
          </div>

          {/* Early Reminder Setting */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              <span>Nhắc trước khi bắt đầu ca</span>
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
                  {mins} phút
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="space-y-3 pt-3 border-t border-border/60">
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
              Kênh thông báo
            </p>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">In-app Toasts</p>
                <p className="text-[10px] text-muted-foreground">Bật thông báo nổi trong ứng dụng</p>
              </div>
              <Switch
                checked={preferences.inAppEnabled}
                onCheckedChange={(v) => onUpdatePreferences({ inAppEnabled: v })}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Browser Push</p>
                <p className="text-[10px] text-muted-foreground">Nhắc nhở khi đang ở tab khác</p>
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
                <p className="text-[10px] text-muted-foreground">Âm thanh chuông 432Hz dịu nhẹ</p>
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
              <span>Bảo vệ trạng thái tập trung</span>
            </p>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Không ngắt Deep Work</p>
                <p className="text-[10px] text-muted-foreground">Chỉ nhận cảnh báo khẩn cấp</p>
              </div>
              <Switch
                checked={preferences.suppressDuringFocus}
                onCheckedChange={(v) => onUpdatePreferences({ suppressDuringFocus: v })}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-foreground">Không làm phiền giờ nghỉ & ngủ</p>
                <p className="text-[10px] text-muted-foreground">Giữ yên lặng trong giờ Break/Sleep</p>
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
