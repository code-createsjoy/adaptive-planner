import React, { useState } from 'react';
import { useP2PChatStore } from '../store/useP2PChatStore';
import { PersonaId } from '../types';
import { Search, UserPlus, MessageSquare, Circle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AddFriendModal } from './AddFriendModal';

interface FriendListPaneProps {
  onSelectFriend?: (friendId: PersonaId) => void;
}

export function FriendListPane({ onSelectFriend }: FriendListPaneProps) {
  const { friends, activeFriendId, setActiveFriendId, activeUserId } = useP2PChatStore();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter out the active user themselves if they happen to be in friends list
  const filteredFriends = friends.filter((f) => {
    if (f.id === activeUserId) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
  });

  const handleSelect = (id: PersonaId) => {
    setActiveFriendId(id);
    if (onSelectFriend) onSelectFriend(id);
  };

  return (
    <div className="flex flex-col h-full bg-card/40 border border-border/70 rounded-2xl md:rounded-3xl backdrop-blur-md overflow-hidden shadow-xs">
      {/* Search & Add Header */}
      <div className="p-3.5 space-y-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground">Direct Chats</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
              {filteredFriends.length}
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="h-8 rounded-xl bg-primary text-primary-foreground text-xs font-semibold px-2.5 gap-1.5 shadow-xs"
          >
            <UserPlus className="size-3.5" />
            <span>Add Friend</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends or email..."
            className="h-9 pl-9 rounded-xl bg-background/60 border-border text-xs"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredFriends.length === 0 ? (
          <div className="text-center py-8 px-4 text-muted-foreground space-y-2">
            <MessageSquare className="size-8 mx-auto opacity-40 text-muted-foreground" />
            <p className="text-xs font-medium">No contacts found</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs rounded-xl border-border"
            >
              Add a friend by Gmail
            </Button>
          </div>
        ) : (
          filteredFriends.map((friend) => {
            const isSelected = activeFriendId === friend.id;
            return (
              <button
                key={friend.id}
                type="button"
                onClick={() => handleSelect(friend.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-2xl text-left transition-all group ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-card/80 text-foreground'
                }`}
              >
                {/* Avatar with Status */}
                <div className="relative size-11 rounded-xl overflow-hidden shrink-0 ring-1 ring-border/50">
                  <img
                    src={friend.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={friend.name}
                    className="size-full object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-background ${
                      friend.status === 'online'
                        ? 'bg-emerald-500'
                        : friend.status === 'busy'
                        ? 'bg-amber-500'
                        : 'bg-muted-foreground'
                    }`}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {friend.name}
                    </span>
                    {friend.lastMessageTime && (
                      <span
                        className={`text-[10px] shrink-0 font-mono ${
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {friend.lastMessageTime}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    }`}
                  >
                    {friend.lastMessage || friend.email}
                  </p>
                </div>

                {/* Unread Badge */}
                {friend.unreadCount > 0 && !isSelected && (
                  <span className="size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold grid place-items-center shrink-0">
                    {friend.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      <AddFriendModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </div>
  );
}
