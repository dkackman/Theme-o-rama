import { create } from 'zustand';

export interface AssetInput {
  xch: string;
  cats: CatInput[];
  nfts: string[];
}

export interface CatInput {
  assetId: string;
  amount: string;
}
export interface OfferExpiration {
  days: string;
  hours: string;
  minutes: string;
}

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
