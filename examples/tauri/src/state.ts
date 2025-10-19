import { create } from 'zustand';

export interface ReturnValue {
  status: 'success' | 'completed' | 'cancelled';
  data?: string;
}

export interface NavigationStore {
  returnValues: Record<string, ReturnValue>;
  setReturnValue: (pageId: string, value: ReturnValue) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
  returnValues: {},
  setReturnValue: (pageId, value) =>
    set((state) => ({
      returnValues: { ...state.returnValues, [pageId]: value },
    })),
}));
