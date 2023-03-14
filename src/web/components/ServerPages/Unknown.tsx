import * as React from 'react';
import { useRouter } from 'next/router';

import { Stack, Text, Button } from '@mantine/core';

export default function ServerPageUnknown({ server }: { server: any }) {
  const router = useRouter();

  return (
    <Stack
      sx={{ height: '100%' }}
      justify="center"
      align="center"
    >
      <Text>This page isn't found.</Text>
      <Button
        onClick={() => {
          if (!server) return router.push(`/`);
          router.push(`/server/${server.id}`);
        }}
      >
        Take me back!
      </Button>
    </Stack>
  )
}