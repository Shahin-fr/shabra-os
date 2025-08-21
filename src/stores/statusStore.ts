import { create } from 'zustand';

export type StatusType = 'idle' | 'loading' | 'success' | 'error';

interface StatusState {
  status: StatusType;
  message: string;
  setStatus: (_status: StatusType, _message?: string) => void;
  reset: () => void;
}

export const useStatusStore = create<StatusState>((set) => ({
  status: 'idle',
  message: '',
  setStatus: (newStatus, newMessage = '') => {
    // Use the parameters to validate before setting state
    if (newStatus && ['idle', 'loading', 'success', 'error'].includes(newStatus)) {
      set({ status: newStatus, message: newMessage || '' });
    }
  },
  reset: () => set({ status: 'idle', message: '' }),
}));
