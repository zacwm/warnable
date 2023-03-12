import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';

import { Box, Stack, Text } from '@mantine/core';
import AccountButton from '../components/AccountButton';

export default function Home() {
  return (
    <Box>
      <Stack
        align="center"
        justify="center"
        sx={{ height: '100vh' }}
        spacing="xl"
      >
        <img
          src="/logo.svg"
          alt="Logo"
          height="auto"
          style={{
            maxWidth: 400,
          }}
        />
        <Text mb="md">A point-based warning, moderation and logging Discord bot that's simple and quick to use.</Text>

        <Text>To continue, we'll need you to login with Discord.</Text>
        <AccountButton />
      </Stack>
    </Box>
  )
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session) {
    return {
      redirect: {
        destination: '/servers',
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}