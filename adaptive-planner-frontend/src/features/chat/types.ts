export type PersonaId = 'user-thai' | 'user-minh' | 'user-lan';

export interface UserPersona {
  id: PersonaId;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'busy' | 'offline';
  statusText?: string;
}

export type ScheduleInviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export interface ScheduleInviteData {
  inviteId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  category: 'social' | 'focus' | 'admin';
  location?: string;
  note?: string;
  senderId: PersonaId;
  recipientId: PersonaId;
  status: ScheduleInviteStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: PersonaId;
  recipientId: PersonaId;
  timestamp: string; // ISO or formatted
  type: 'text' | 'schedule_invite';
  text?: string;
  invite?: ScheduleInviteData;
}

export interface FriendContact extends UserPersona {
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}
