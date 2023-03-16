import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import { Paper, Stack, Image, Box, UnstyledButton, Text, Group, Skeleton } from '@mantine/core';
import ServerIcon from './ServerIcon';

function NavLinkButton({ href, icon, name }: { href: string, icon?: React.ReactNode, name: string }) {
  const router = useRouter();

  return (
    <UnstyledButton
      sx={(theme) => ({
        display: 'flex',
        padding: '0.5rem',
        borderRadius: 12,
        transition: 'background-color 100ms ease-out',
        '&:hover': {
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
        },
      })}
      onClick={() => router.push(href, undefined, { shallow: true })}
    >
      <Group>
        <Text fz={18}>{name}</Text>
      </Group>
    </UnstyledButton>
  )
}

function NavBox({ loading, server }: { loading: boolean, server?: { id: string, name: string, icon: string } }) {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <Box
      sx={{
        height: '100vh',
        padding: 20,
        boxSizing: 'border-box'
      }}
    >
      <Paper
        p="md"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          height: '100%',
          width: 350,
        })}
        radius={12}
      >
        <Stack
          sx={{
            height: '100%',
          }}
        >
          <Stack>
            <Image
              src="/logo.svg"
              alt="Warnable Logo"
              width="100%"
              fit="contain"
              onClick={() => router.push('/servers')}
              sx={{ cursor: 'pointer' }}
            />
            { !loading ? (
              <UnstyledButton
                sx={(theme) => ({
                  display: 'flex',
                  padding: '0.5rem',
                  borderRadius: 12,
                  transition: 'background-color 100ms ease-out',
                  '&:hover': {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                  },
                })}
                onClick={() => router.push('/servers')}
              >
                <Group>
                  <ServerIcon
                    guildName={server?.name}
                    guildId={server?.id}
                    size={35}
                  />
                  <Stack
                    spacing={0}
                    align="left"
                  >
                    <Text fz={20}>{ server?.name }</Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            ) : (
              <Group sx={{ padding: '0.5rem 0.5rem', }}>
                <Skeleton height={35} circle />
                <Skeleton height={20} radius="xl" width="50%" />
              </Group>
            ) }
          </Stack>
          <Stack sx={{ flex: 1 }} spacing={2}>
            { !loading ? (
              <React.Fragment>
                <NavLinkButton href={`/server/${server?.id}`} name="Main Page" />
                <NavLinkButton href={`/server/${server?.id}/warnings`} name="All Warnings" />
                <NavLinkButton href={`/server/${server?.id}/users`} name="Users" />
                <NavLinkButton href={`/server/${server?.id}/Punishments`} name="Punishments" />
                <NavLinkButton href={`/server/${server?.id}/config`} name="Config" />
              </React.Fragment>
            ) : (
              <Stack sx={{ padding: '0 0.5rem' }}>
                { [1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                  const width = Math.floor(Math.random() * 40) + 50;
                  return (
                    <Skeleton key={i} height={20} radius="xl" width={`${width}%`} mb="md" />
                  )
                })}
              </Stack>
            ) }
          </Stack>
          <Stack spacing={2}>
            { session ? (
              <UnstyledButton
                sx={(theme) => ({
                  display: 'flex',
                  padding: '0.5rem 1rem',
                  borderRadius: 12,
                  transition: 'background-color 100ms ease-out',
                  '&:hover': {
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                  }
                })}
              >
                <Group>
                  <Image src={ session?.user?.image } radius="50%" height={40} width={40} />
                  <Stack
                    spacing={0}
                    align="left"
                  >
                    <Text fz={16}>Logged in as</Text>
                    <Text fz={20}>{ session?.user?.name }</Text>
                  </Stack>
                </Group>
              </UnstyledButton>
            ) : null }
          </Stack>
        </Stack>
      </Paper>
    </Box>
  )
}

export default NavBox;