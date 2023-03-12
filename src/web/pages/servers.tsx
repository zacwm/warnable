import * as React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]';
import { useSession } from 'next-auth/react';
import fetch from 'node-fetch';

import { Container, Stack, Group, Text, Avatar, Button, Box } from '@mantine/core';
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

export default function Servers({ clientId, servers }: { clientId: string, servers: any }) {
  const { data: session } = useSession();

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
              servers.map((server: any) => {
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

  const sequelizeDatabase = global.database;
  const accountsModel = await sequelizeDatabase.models.account;
  const account = await accountsModel.findOne({
    where: {
      userId: session.user.id,
    }
  });

  if (!account) return { props: { error: true } };

  const accessToken = account.access_token;
  const servers = [];

  // TODO: THIS MUST BE REDONE -- THIS IS JUST SO I CAN GET A LIST TEMPORARILY WORKING TO CONTINUE DEVLOPMENT ON THE SERVER PAGE.
  // also... this will be moved to a API route that will be called from the client side.
  const response = await fetch('https://discord.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const json: any = await response.json();
  const filtered = (json || []).filter((server) => server.owner || server.permissions & 32);
  const DiscordClient = global.client;

  for (const server of filtered) {
    let inServer = false;
    try {
      // Check if in cache first
      const guild = DiscordClient.guilds.cache.get(server.id);
      if (guild) inServer = true;

      // If not in cache, fetch from API
      if (!guild) {
        await DiscordClient.guilds.fetch(server.id);
        inServer = true;
      }
    } catch (e) {
      inServer = false;
    }

    servers.push({
      id: server.id,
      name: server.name,
      icon: server.icon,
      inServer: inServer,
    });
  }

  // Sort inServer to top
  servers.sort((a, b) => {
    if (a.inServer && !b.inServer) return -1;
    if (!a.inServer && b.inServer) return 1;
    return 0;
  });

  if (account && servers) {
    return {
      props: {
        servers,
        clientId: DiscordClient.user.id,
      }
    }
  }

  return { props: { error: true } }
}