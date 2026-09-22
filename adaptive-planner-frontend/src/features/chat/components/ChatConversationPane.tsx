import React, { useState, useRef, useEffect } from 'react';
import { useP2PChatStore, DEMO_PERSONAS } from '../store/useP2PChatStore';
import { PersonaId } from '../types';
import { ScheduleInviteCard } from './ScheduleInviteCard';
import { InviteScheduleModal } from './InviteScheduleModal';
import {
  Send,
  CalendarPlus,
  Smile,
  MoreVertical,
  Circle,
  MessageSquare,
  Sparkles,
  Coffee,
  CalendarCheck2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatConversationPaneProps {
  onBackMobile?: () => void;
}

export function ChatConversationPane({ onBackMobile }: ChatConversationPaneProps) {
  const {
    activeUserId,
    activeFriendId,
    friends,
    messages,
    sendTextMessage,
  } = useP2PChatStore();

  const [input, setInput] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeFriend = friends.find((f) => f.id === activeFriendId);
  const activeUser = DEMO_PERSONAS[activeUserId] || DEMO_PERSONAS['user-thai'];

  // Filter messages between activeUser and activeFriend
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderId === activeUserId && m.recipientId === activeFriendId) ||
      (m.senderId === activeFriendId && m.recipientId === activeUserId)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length, activeFriendId]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activeFriendId) return;
    sendTextMessage(activeFriendId, input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeFriend) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card/40 border border-border/70 rounded-2xl md:rounded-3xl backdrop-blur-md">
        <div className="p-4 rounded-3xl bg-primary/10 text-primary mb-3">
          <MessageSquare className="size-8" />
        </div>
        <h3 className="text-base font-bold text-foreground">Select a conversation</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          Choose a friend from the list to start messaging or propose a schedule invite.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card/40 border border-border/70 rounded-2xl md:rounded-3xl backdrop-blur-md overflow-hidden shadow-xs">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-border/60 bg-card/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackMobile}
              className="md:hidden text-xs px-2 h-8"
            >
              ← Back
            </Button>
          )}
          <div className="relative size-10 rounded-xl overflow-hidden shrink-0 ring-1 ring-border">
            <img
              src={activeFriend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={activeFriend.name}
              className="size-full object-cover"
            />
            <span
              className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background ${
                activeFriend.status === 'online'
                  ? 'bg-emerald-500'
                  : activeFriend.status === 'busy'
                  ? 'bg-amber-500'
                  : 'bg-muted-foreground'
              }`}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              {activeFriend.name}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate font-mono">
              {activeFriend.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="rounded-xl bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-semibold h-8.5 px-3 gap-1.5 border border-primary/25 shadow-xs transition-all"
          >
            <CalendarPlus className="size-3.5" />
            <span className="hidden sm:inline">Propose Invite</span>
          </Button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Intro banner */}
        <div className="flex flex-col items-center justify-center py-4 text-center space-y-1">
          <div className="size-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-1">
            <CalendarCheck2 className="size-6" />
          </div>
          <p className="text-xs font-bold text-foreground">
            End-to-End Chat & Social Coordination with {activeFriend.name}
          </p>
          <p className="text-[11px] text-muted-foreground max-w-sm">
            Propose meeting times, coordinate joint focus sessions, and auto-sync confirmed slots to both of your Modo timelines.
          </p>
        </div>

        {/* Message Bubbles */}
        {conversationMessages.map((msg) => {
          const isMe = msg.senderId === activeUserId;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              {msg.type === 'schedule_invite' && msg.invite ? (
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <ScheduleInviteCard invite={msg.invite} />
                  <span className="text-[10px] text-muted-foreground font-mono px-1 mt-1">
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                  {!isMe && (
                    <div className="size-6 rounded-lg overflow-hidden shrink-0 ring-1 ring-border mb-1">
                      <img
                        src={activeFriend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={activeFriend.name}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isMe
                          ? 'bg-primary text-primary-foreground font-medium rounded-br-xs shadow-xs'
                          : 'bg-card border border-border text-foreground font-normal rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div
                      className={`text-[10px] text-muted-foreground font-mono mt-0.5 px-1 ${
                        isMe ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Footer */}
      <div className="p-3 border-t border-border/60 bg-card/60 backdrop-blur-md">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsInviteModalOpen(true)}
            title="Create Schedule Invitation"
            className="size-10 rounded-xl shrink-0 border-primary/30 text-primary hover:bg-primary/10"
          >
            <CalendarPlus className="size-4" />
          </Button>

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeFriend.name}...`}
            className="h-10 rounded-xl bg-background/80 border-border text-xs flex-1"
          />

          <Button
            type="submit"
            disabled={!input.trim()}
            size="icon"
            className="size-10 rounded-xl bg-primary text-primary-foreground shrink-0 shadow-xs disabled:opacity-40"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </div>

      {/* Schedule Invite Modal */}
      <InviteScheduleModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        recipientId={activeFriend.id}
        recipientName={activeFriend.name}
      />
    </div>
  );
}
