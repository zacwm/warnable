import * as React from 'react';
import { useRouter } from 'next/router';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';

import { Group, Box, Loader, Stack } from '@mantine/core';
import SideNav from '../../components/SideNav';

import ServerPageMain from '../../components/ServerPages/Main';
import ServerPageWarnings from '../../components/ServerPages/Warnings';
import ServerPageWarning from '../../components/ServerPages/Warning';
import ServerPageUsers from '../../components/ServerPages/Users';
import ServerPunishments from '../../components/ServerPages/Punishments';
import ServerPageConfig from '../../components/ServerPages/Config';
import ServerPageUnknown from '../../components/ServerPages/Unknown';

export default function Server() {
  const router = useRouter();
  const serverQuery = router.query.server;
  const guildId = serverQuery[0];
  const page = serverQuery[1] || 'main';

  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingError, setLoadingError] = React.useState(false);
  const [serverNotFound, setServerNotFound] = React.useState(false);
  const [serverData, setServerData] = React.useState(null);

  React.useEffect(() => {
    if (!guildId) return;
    setLoadingData(true);

    fetch(`/api/server/${guildId}`)
      .then(res => {
        if (res.status === 404) {
          setServerNotFound(true);
          return;
        } else if (!res.ok) {
          throw new Error(`Failed to fetch server data: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setServerData(data);
      })
      .catch(err => {
        console.error(err);
        setLoadingError(true);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }, [guildId]);

  React.useEffect(() => {
    console.dir(serverData);
  }, [serverData]);

  let PageComponent = null;

  switch (page) {
    case 'main':
      PageComponent = ServerPageMain;
      break;
    case 'warnings':
      PageComponent = ServerPageWarnings;
      break;
    case 'warning':
      PageComponent = ServerPageWarning;
      break;
    case 'users': 
      PageComponent = ServerPageUsers;
      break;
    case 'punishments':
      PageComponent = ServerPunishments;
      break;
    case 'config':
      PageComponent = ServerPageConfig;
      break;
    default:
      PageComponent = ServerPageUnknown;
      break;
  }

  return (
    <Group align="top" spacing={0}>
      <SideNav 
        loading={loadingData}
        server={serverData}
      />
      <Box sx={{
        padding: 20,
        flex: 1,
      }}>
        {
          loadingData ? (
            <Stack
              align="center"
              justify="center"
              sx={{
                height: '100%',
              }}
            >
              <Loader size="lg" />
            </Stack>
          ) : (
            <PageComponent server={serverData} />
          )
        }
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