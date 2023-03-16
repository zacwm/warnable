import * as React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useSession } from 'next-auth/react';

import { Container, Stack, Group, Text, Skeleton, Button, Box } from '@mantine/core';
import MenuNav from '../components/MenuNav';
import ServerIcon from '../components/ServerIcon';

function ServerItem({ clientId, server }: { clientId: string, server: any }) {
  return (
    <Group>
      <ServerIcon
        iconId={server.icon}
        guildId={server.id}
        guildName={server.name}
      />
      <Stack sx={{ flex: 1 }}>
        <Text>{ server.name }</Text>
      </Stack>
      {
        server.inServer ? (
          <Link href={`/server/${server.id}`}>
            <Button sx={{
              borderRadius: 12,
              backgroundColor: '#cd4177',
              transition: 'background-color 100ms ease-out',
              '&:hover': {
                backgroundColor: '#ac4d98 !important',
              }
            }}>
              Manage Server
            </Button>
          </Link>
        ) : (
          <Link href={`https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot&guild_id=${server.id}`}>
            <Button>
              Add To Server
            </Button>
          </Link>
        )
      }
    </Group>
  )
}

export default function Servers() {
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = React.useState(true);
  const [servers, setServers] = React.useState<any[]>([]);
  const [clientId, setClientId] = React.useState<string>('');

  React.useEffect(() => {
    async function fetchServers() {
      const res = await fetch('/api/servers');
      const data: any = await res.json();

      setServers(data.servers);
      setClientId(data.clientId);
      setIsLoading(false);
    }

    fetchServers();
  }, []);

  return (
    <div>
      <Container size="sm" p="md">
        <Stack spacing="xl">
          <MenuNav
            username={session?.user?.name}
            avatar={session?.user?.image}
          />

          <Stack
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              borderRadius: 12,
            })}
            p="sm"
          >
            {
              isLoading ? (
                <Stack>
                  {
                    Array.from({ length: 15 }).map((_, i) => {
                      const randomNameLength = Math.floor(Math.random() * 100) + 50;
                      return (
                        <Group key={i}>
                          <Skeleton width={40} height={40} radius="xl" />
                          <Stack sx={{ flex: 1 }}>
                            <Skeleton width={100 + randomNameLength} height={20} radius="xl" />
                          </Stack>
                          <Skeleton width={100} height={40} radius="xl" />
                        </Group>
                      )
                    })
                  }
                </Stack>
              ) : servers.map((server: any) => {
                // Check if next server is not in server
                const nextNotInServer = servers[servers.indexOf(server) + 1] ? server.inServer && !servers[servers.indexOf(server) + 1].inServer : false;

                if (nextNotInServer) {
                  return (
                    <React.Fragment key={server.id}>
                      <ServerItem
                        clientId={clientId}
                        server={server}
                      />
                      <Box
                        sx={{
                          height: 1,
                          margin: '0.5rem 0',
                          backgroundColor: '#ffffff25',
                        }}
                      />
                    </React.Fragment>
                  );
                }

                return (
                  <ServerItem
                    key={server.id}
                    clientId={clientId}
                    server={server}
                  />
                );
              })
            }
          </Stack>
        </Stack>
      </Container>
    </div>
  )
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