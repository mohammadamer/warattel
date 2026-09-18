import { create } from 'zustand';
import { DailyPlanItem, RecitationResult, WeakPassage } from '../types';
import { dailyPlan, recentRecitations, weakPassages } from '../data/mockData';

type AppState = {
  dailyPlan: DailyPlanItem[];
  recentRecitations: RecitationResult[];
  weakPassages: WeakPassage[];
  streak: number;
  retentionScore: number;
  latestRecitation: RecitationResult | null;
  setDailyPlan: (items: DailyPlanItem[]) => void;
  setLatestRecitation: (result: RecitationResult) => void;
};

export const useAppStore = create<AppState>((set) => ({
  dailyPlan,
  recentRecitations,
  weakPassages,
  streak: 12,
  retentionScore: 87,
  latestRecitation: null,
  setDailyPlan: (items) => set({ dailyPlan: items }),
  setLatestRecitation: (result) =>
    set((state) => {
      const recentRecitations = [result, ...state.recentRecitations.filter((item) => item.id !== result.id)];
      return {
        latestRecitation: result,
        recentRecitations: recentRecitations.slice(0, 8),
      };
    }),
}));
