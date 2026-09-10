import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';

function TiledHeatmapProvider(props: PropsWithChildren) {
  const { children } = props;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            networkMode: 'always', // always fire queries regardless of online/offline status
            staleTime: 'static', // never ever refetch cached data
            gcTime: 15 * 60 * 1000, // keep cached data with no active queries for 15 min
            retry: false, // never retry fetching automatically on error
            structuralSharing: false, // not relevant since data is never refetched
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default TiledHeatmapProvider;
