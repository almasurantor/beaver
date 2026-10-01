import { create } from 'zustand';
import { Profile } from '@/lib/types';

interface Store {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
