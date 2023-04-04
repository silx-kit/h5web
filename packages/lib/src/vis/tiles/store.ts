import { create } from 'zustand';

interface TooltipStore {
  val: { x: number; y: number; v: number } | undefined;
  setTooltipValue: (x: number, y: number, v: number) => void;
}

export const useTooltipStore = create<TooltipStore>((set) => ({
  val: undefined,
  setTooltipValue: (x: number, y: number, v: number) =>
    set(() => ({
      val: { x, y, v },
    })),
}));
