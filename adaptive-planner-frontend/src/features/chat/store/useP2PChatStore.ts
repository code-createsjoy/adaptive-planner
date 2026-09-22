import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, FriendContact, PersonaId, ScheduleInviteData, UserPersona } from '../types';

export const DEMO_PERSONAS: Record<PersonaId, UserPersona> = {
  'user-thai': {
    id: 'user-thai',
    name: 'Thai',
    email: 'quoc.thai@modo.app',
    avatarUrl: '/thai-avatar.jpg',
    status: 'online',
    statusText: 'Focusing on Modo roadmap 🎯',
  },
  'user-minh': {
    id: 'user-minh',
    name: 'Minh (UI Designer)',
    email: 'minh.designer@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    statusText: 'Designing glassmorphic cards 🎨',
  },
  'user-lan': {
    id: 'user-lan',
    name: 'Lan (Product Lead)',
    email: 'lan.product@gmail.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    status: 'busy',
    statusText: 'In planning review 📊',
  },
};

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const INITIAL_FRIENDS: FriendContact[] = [
  {
    ...DEMO_PERSONAS['user-thai'],
    unreadCount: 0,
    lastMessage: 'Yes Minh, looks super crisp! We should sync up...',
    lastMessageTime: '10:40 AM',
  },
  {
    ...DEMO_PERSONAS['user-minh'],
    unreadCount: 1,
    lastMessage: 'Coffee & Design Sync invitation',
    lastMessageTime: '10:42 AM',
  },
  {
    ...DEMO_PERSONAS['user-lan'],
    unreadCount: 0,
    lastMessage: 'Great progress on the sprint goal!',
    lastMessageTime: 'Yesterday',
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-minh',
    recipientId: 'user-thai',
    timestamp: '10:38 AM',
    type: 'text',
    text: 'Hey Thai! Have you checked out the new squircle cards and companion preview?',
  },
  {
    id: 'msg-2',
    senderId: 'user-thai',
    recipientId: 'user-minh',
    timestamp: '10:40 AM',
    type: 'text',
    text: 'Yes Minh, looks super crisp! We should sync up on the peer-to-peer social scheduling flow.',
  },
  {
    id: 'msg-3',
    senderId: 'user-minh',
    recipientId: 'user-thai',
    timestamp: '10:42 AM',
    type: 'schedule_invite',
    text: 'Sent a meeting invitation',
    invite: {
      inviteId: 'inv-101',
      title: 'Coffee & Design Sync ☕',
      date: getTomorrowDateString(),
      startTime: '15:00',
      endTime: '16:00',
      category: 'social',
      location: 'Highlands Coffee / Discord Voice',
      note: 'Walk through the adaptive timeline and discuss meeting slots',
      senderId: 'user-minh',
      recipientId: 'user-thai',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    },
  },
];

interface P2PChatState {
  activeUserId: PersonaId;
  activeFriendId: PersonaId | null;
  friends: FriendContact[];
  messages: ChatMessage[];
  searchQuery: string;

  // Actions
  setActiveUserId: (id: PersonaId) => void;
  setActiveFriendId: (id: PersonaId | null) => void;
  setSearchQuery: (query: string) => void;
  sendTextMessage: (recipientId: PersonaId, text: string) => void;
  sendScheduleInvite: (
    recipientId: PersonaId,
    inviteData: Omit<ScheduleInviteData, 'inviteId' | 'senderId' | 'recipientId' | 'status' | 'createdAt'>
  ) => void;
  respondToInvite: (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => void;
  addFriendByEmail: (email: string, name?: string) => { success: boolean; message: string };
  resetDemoData: () => void;
}

export const useP2PChatStore = create<P2PChatState>()(
  persist(
    (set, get) => ({
      activeUserId: 'user-thai',
      activeFriendId: 'user-minh',
      friends: INITIAL_FRIENDS,
      messages: INITIAL_MESSAGES,
      searchQuery: '',

      setActiveUserId: (nextUserId: PersonaId) => {
        set((state) => {
          // Guarantee that both Thai and Minh exist in the friends list
          let updatedFriends = [...state.friends];
          Object.values(DEMO_PERSONAS).forEach((persona) => {
            if (!updatedFriends.some((f) => f.id === persona.id || f.email.toLowerCase() === persona.email.toLowerCase())) {
              updatedFriends.push({
                ...persona,
                unreadCount: 0,
                lastMessage: 'Connected on Modo',
                lastMessageTime: '10:00 AM',
              });
            }
          });

          // Switch active friend automatically:
          // If switching to Minh -> active chat is Thai
          // If switching to Thai -> active chat is Minh
          const targetFriendId: PersonaId =
            nextUserId === 'user-thai' ? 'user-minh' : 'user-thai';

          return {
            activeUserId: nextUserId,
            activeFriendId: targetFriendId,
            friends: updatedFriends,
          };
        });
      },

      setActiveFriendId: (id: PersonaId | null) => {
        set((state) => {
          if (!id) return { activeFriendId: null };
          // Mark unread as 0 for this friend
          const updatedFriends = state.friends.map((f) =>
            f.id === id ? { ...f, unreadCount: 0 } : f
          );
          return { activeFriendId: id, friends: updatedFriends };
        });
      },

      setSearchQuery: (searchQuery: string) => set({ searchQuery }),

      sendTextMessage: (recipientId: PersonaId, text: string) => {
        if (!text.trim()) return;
        const state = get();
        const activeUser = state.activeUserId;
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: activeUser,
          recipientId,
          timestamp: timeFormatted,
          type: 'text',
          text: text.trim(),
        };

        const updatedFriends = state.friends.map((f) => {
          if (f.id === recipientId) {
            return {
              ...f,
              lastMessage: text.trim(),
              lastMessageTime: timeFormatted,
            };
          }
          return f;
        });

        set({
          messages: [...state.messages, newMessage],
          friends: updatedFriends,
        });
      },

      sendScheduleInvite: (recipientId, inviteData) => {
        const state = get();
        const activeUser = state.activeUserId;
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newInvite: ScheduleInviteData = {
          ...inviteData,
          inviteId: `inv-${Date.now()}`,
          senderId: activeUser,
          recipientId,
          status: 'PENDING',
          createdAt: now.toISOString(),
        };

        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: activeUser,
          recipientId,
          timestamp: timeFormatted,
          type: 'schedule_invite',
          text: `Meeting invite: ${inviteData.title}`,
          invite: newInvite,
        };

        const updatedFriends = state.friends.map((f) => {
          if (f.id === recipientId) {
            return {
              ...f,
              lastMessage: `Invite: ${inviteData.title}`,
              lastMessageTime: timeFormatted,
            };
          }
          return f;
        });

        set({
          messages: [...state.messages, newMessage],
          friends: updatedFriends,
        });
      },

      respondToInvite: (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => {
        set((state) => ({
          messages: state.messages.map((m) => {
            if (m.type === 'schedule_invite' && m.invite?.inviteId === inviteId) {
              return {
                ...m,
                invite: {
                  ...m.invite,
                  status,
                },
              };
            }
            return m;
          }),
        }));
      },

      addFriendByEmail: (email: string, name?: string) => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        const existing = state.friends.find((f) => f.email.toLowerCase() === cleanEmail);
        if (existing) {
          return { success: false, message: 'This user is already in your friends list.' };
        }

        // Check against known demo personas or generate a nice mock friend
        const personaMatch = Object.values(DEMO_PERSONAS).find(
          (p) => p.email.toLowerCase() === cleanEmail
        );

        const newFriend: FriendContact = personaMatch
          ? { ...personaMatch, unreadCount: 0 }
          : {
              id: `user-${Date.now()}` as PersonaId,
              name: name || cleanEmail.split('@')[0],
              email: cleanEmail,
              status: 'online',
              statusText: 'Connected via Gmail 💌',
              unreadCount: 0,
              lastMessage: 'Added as friend',
              lastMessageTime: 'Just now',
            };

        set({
          friends: [newFriend, ...state.friends],
          activeFriendId: newFriend.id,
        });

        return { success: true, message: `Added ${newFriend.name} to friends!` };
      },

      resetDemoData: () => {
        set({
          activeUserId: 'user-thai',
          activeFriendId: 'user-minh',
          friends: INITIAL_FRIENDS,
          messages: INITIAL_MESSAGES,
          searchQuery: '',
        });
      },
    }),
    {
      name: 'modo_p2p_chat_storage_v2', // bumped storage key to guarantee clean state
    }
  )
);
