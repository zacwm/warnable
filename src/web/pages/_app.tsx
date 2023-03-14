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
          globalStyles: (theme) => ({
            '.mantine-Button-root': {
              borderRadius: 12,
              backgroundColor: '#cf4277',
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: '#5e69e6',
              },
            }
          })
        }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
}