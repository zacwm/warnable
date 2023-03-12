import { Button, Stack, Text } from '@mantine/core';
import Link from 'next/link';

export default function ServerNotFound() {
  return (
    <Stack
      align="center"
      justify="center"
      sx={{
        height: '100vh',
      }}
    >
      <Text fz={30}>Hmm, I couldn't find that server...</Text>
      <Link href="/servers" passHref>
        <Button component="a" size="md">Go back</Button>
      </Link>
    </Stack>
  );
}