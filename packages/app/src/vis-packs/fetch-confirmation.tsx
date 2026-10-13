import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';

interface ContextValue {
  scope: string;
  confirmedSizes: Map<string, number>;
  setConfirmedSizes: (
    update: (prev: Map<string, number>) => Map<string, number>,
  ) => void;
}

const FetchConfirmationContext = createContext<ContextValue | undefined>(
  undefined,
);

interface Props {
  scope: string; // e.g. name of active visualization
}

/* Remember sizes of large fetches confirmed by the user outside of the vis' error boundary,
 * so that retrying a failed fetch doesn't ask for confirmation again */
export function FetchConfirmationProvider(props: PropsWithChildren<Props>) {
  const { scope, children } = props;

  const [confirmedSizes, setConfirmedSizes] = useState(
    () => new Map<string, number>(),
  );

  const value = useMemo(
    () => ({ scope, confirmedSizes, setConfirmedSizes }),
    [scope, confirmedSizes],
  );

  return (
    <FetchConfirmationContext value={value}>
      {children}
    </FetchConfirmationContext>
  );
}

export function useConfirmedSize(
  key: string,
): [number, (size: number) => void] {
  const context = useContext(FetchConfirmationContext);
  const [localSize, setLocalSize] = useState(0); // fallback when rendered outside of provider

  if (!context) {
    return [localSize, setLocalSize];
  }

  const { scope, confirmedSizes, setConfirmedSizes } = context;
  const scopedKey = `${scope}:${key}`;

  return [
    confirmedSizes.get(scopedKey) ?? 0,
    (size) => setConfirmedSizes((prev) => new Map(prev).set(scopedKey, size)),
  ];
}
