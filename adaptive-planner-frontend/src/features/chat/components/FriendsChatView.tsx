import React, { useState } from 'react';
import { PersonaSwitcherWidget } from './PersonaSwitcherWidget';
import { FriendListPane } from './FriendListPane';
import { ChatConversationPane } from './ChatConversationPane';
import { useP2PChatStore } from '../store/useP2PChatStore';
import { MessageSquare, Users2, Sparkles, ShieldCheck } from 'lucide-react';

export function FriendsChatView() {
  const { activeFriendId } = useP2PChatStore();
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] max-w-7xl mx-auto space-y-3.5 animate-in fade-in duration-300">
      {/* Top Bar: Title & Demo Persona Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users2 className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Friends & Chat
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Direct peer messaging with zero-friction in-chat schedule coordination.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <PersonaSwitcherWidget />
        </div>
      </div>

      {/* Main Grid: Left Contacts, Right Chat Pane */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3.5 min-h-0">
        {/* Desktop Left Contacts / Mobile Contacts List */}
        <div
          className={`md:col-span-4 lg:col-span-4 h-full ${
            mobileView === 'chat' ? 'hidden md:block' : 'block'
          }`}
        >
          <FriendListPane
            onSelectFriend={() => {
              setMobileView('chat');
            }}
          />
        </div>

        {/* Desktop Right Chat / Mobile Active Chat */}
        <div
          className={`md:col-span-8 lg:col-span-8 h-full ${
            mobileView === 'list' && !activeFriendId ? 'hidden md:block' : 'block'
          }`}
        >
          <ChatConversationPane onBackMobile={() => setMobileView('list')} />
        </div>
      </div>
    </div>
  );
}
