import { create } from 'zustand';
import { UserDto } from '@/types/auth';

interface AuthState {
  user: UserDto;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;

  setUser: (user: UserDto) => void;
  updateUser: (partial: Partial<UserDto>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

const DEFAULT_MVP_USER: UserDto = {
  id: 1,
  name: 'Thai',
  email: 'quocthaiarct2005@gmail.com',
  platformRole: 'PERSONAL_USER',
  journeyStage: 'EXPLORING',
  onboardingCompleted: true,
};

export const useAuthStore = create<AuthState>((set) => ({
  user: DEFAULT_MVP_USER,
  isAuthenticated: true,
  isLoading: false,
  authError: null,

  setUser: (user) => set({ user, isAuthenticated: true }),
  updateUser: (partial) =>
    set((state) => ({
      user: { ...state.user, ...partial },
    })),
  setOnboardingCompleted: (completed) =>
    set((state) => ({
      user: { ...state.user, onboardingCompleted: completed },
    })),
}));
