import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../../backend/src/trpc/routers';

export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 1000,
    },
  },
});

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL || 'http://localhost:4000/trpc',
      headers: () => {
        const token = localStorage.getItem('auth-token');
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    }),
  ],
});

export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // browser should use relative url (proxy)
    return '';
  }
  if (process.env.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  // assume localhost
  return `http://localhost:4000`;
}; 