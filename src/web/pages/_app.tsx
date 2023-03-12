import { MantineProvider } from '@mantine/core';
import { SessionProvider } from 'next-auth/react';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps & { session: Session }) {
  return (
    <SessionProvider session={session}>
      <MantineProvider
        theme={{
          colorScheme: 'dark',
          components: {
            Button: {
              defaultProps: {
                sx: {
                  borderRadius: 12,
                  backgroundColor: '#5a6be9',
                  transition: 'background-color 100ms ease-out',
                  '&:hover': {
                    backgroundColor: '#7462d1',
                  }
                }
              },
            },
          },
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
}