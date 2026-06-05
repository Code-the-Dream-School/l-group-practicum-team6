import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { createTestQueryClient } from './createTestQueryClient';

export function QueryClientTestProvider({
  children,
  client = createTestQueryClient(),
}: {
  children: ReactNode;
  client?: QueryClient;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
