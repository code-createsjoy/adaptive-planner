import React, { useMemo, useState } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Plus,
  MessageSquare,
  Trash2,
  Search,
  Sparkles,
  ChevronRight,
  Clock,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/types/planner";

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: number) => void;
  onOpenActivityHistory: () => void;
  className?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onOpenActivityHistory,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.lastMessagePreview && c.lastMessagePreview.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  const groupedConversations = useMemo(() => {
    const groups: {
      today: Conversation[];
      yesterday: Conversation[];
      thisMonth: Conversation[];
      older: Conversation[];
    } = {
      today: [],
      yesterday: [],
      thisMonth: [],
      older: [],
    };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    filteredConversations.forEach((conv) => {
      try {
        const d = parseISO(conv.updatedAt || conv.createdAt);
        if (isToday(d)) {
          groups.today.push(conv);
        } else if (isYesterday(d)) {
          groups.yesterday.push(conv);
        } else if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          groups.thisMonth.push(conv);
        } else {
          groups.older.push(conv);
        }
      } catch {
        groups.older.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const renderGroup = (title: string, list: Conversation[]) => {
    if (list.length === 0) return null;

    return (
      <div className="space-y-1">
        <h4 className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          {title}
        </h4>
        <div className="space-y-0.5">
          {list.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "text-foreground/80 hover:bg-muted/80"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0">
                  <MessageSquare
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate leading-tight font-medium">
                      {conv.title || "Cuộc trò chuyện"}
                    </span>
                    {conv.lastMessagePreview && !isActive && (
                      <span className="truncate text-[10px] text-muted-foreground/80 mt-0.5">
                        {conv.lastMessagePreview}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete action button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Bạn có chắc muốn xoá phiên chat này?")) {
                      onDeleteConversation(conv.id);
                    }
                  }}
                  className={`ml-1 shrink-0 rounded p-1 transition-opacity ${
                    isActive
                      ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/20"
                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  } ${hoveredId === conv.id ? "opacity-100" : "opacity-0"}`}
                  title="Xoá cuộc trò chuyện"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full bg-card/60 backdrop-blur-md border-r border-border/50 ${className}`}>
      {/* Sidebar Header */}
      <div className="p-3.5 space-y-2.5 border-b border-border/40">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium border border-primary/20 shadow-none transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Cuộc trò chuyện mới</span>
        </Button>

        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm phiên chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-background/80 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-30 stroke-1" />
            <p className="text-xs">Chưa có cuộc trò chuyện nào</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              Nhập yêu cầu vào khung chat để bắt đầu phiên mới
            </p>
          </div>
        ) : (
          <>
            {renderGroup("Hôm nay", groupedConversations.today)}
            {renderGroup("Hôm qua", groupedConversations.yesterday)}
            {renderGroup("Tháng này", groupedConversations.thisMonth)}
            {renderGroup("Cũ hơn", groupedConversations.older)}
          </>
        )}
      </div>

      {/* Footer link to Activity / Decision History */}
      <div className="p-3 border-t border-border/40 bg-card/30">
        <Button
          variant="outline"
          onClick={onOpenActivityHistory}
          className="w-full justify-start gap-2 rounded-xl text-xs font-normal border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <History className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Lịch sử quyết định & Undo</span>
          <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
        </Button>
      </div>
    </div>
  );
};
