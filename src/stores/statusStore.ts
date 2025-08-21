import { create } from 'zustand';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface StatusState {
  status: StatusType;
  message: string;
  setStatus: (status: StatusType, message?: string) => void;
  reset: () => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: 'idle',
  message: '',
  setStatus: (status, message = '') => set({ status, message }),
  reset: () => set({ status: 'idle', message: '' }),
}));
