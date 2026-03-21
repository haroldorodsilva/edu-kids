import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes — localStorage doesn't change externally
      gcTime: 1000 * 60 * 30,
      retry: false,               // localStorage never fails transiently
    },
  },
});
