import { createContext, useContext } from 'react';

export interface ToggleGroupContextValue {
  role: 'tablist' | 'radiogroup';
  value: string;
  disabled?: boolean;
  onChange: (val: string) => void;
}

export const ToggleGroupContext = createContext<
  ToggleGroupContextValue | undefined
>(undefined);

export function useToggleGroupProps(): ToggleGroupContextValue {
  const context = useContext(ToggleGroupContext);

  if (!context) {
    throw new Error('Missing Toggle Group provider.');
  }

  return context;
}
