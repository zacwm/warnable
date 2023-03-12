import * as React from 'react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';

import { Group, Box, Text } from '@mantine/core';
import SideNav from '../../../components/SideNav';

export default function Server() {
  const router = useRouter();
  const { guildid } = router.query;

  const [loadingData, setLoadingData] = React.useState(true);
  const [serverData, setServerData] = React.useState(null);

  return (
    <Group align="top" spacing={0}>
      <SideNav loading={true} />
      <Box sx={{
        padding: 20,
      }}>
        <Text>{guildid}</Text>
      </Box>
    </Group>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }

  return { props: {} }
}