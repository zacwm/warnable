import { signOut } from 'next-auth/react';

import { Group, Stack, UnstyledButton, Text, Image } from '@mantine/core';

export default function MenuNav({ username, avatar }: { username: string, avatar: string }) {
  return (
    <Stack
      align="center"
      sx={(theme) => ({
        backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
        borderRadius: 12,
      })}
      p="sm"
    >
      <img
        src="/logo.svg"
        alt="Warnable Logo"
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '300px',
        }}
      />
      <Group
        grow
        sx={{
          width: '100%',
        }}
      >
        <UnstyledButton
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'center',
            padding: '0.2rem 1rem',
            borderRadius: 6,
            transition: 'background-color 100ms ease-out',
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            }
          })}
        >
          <Text fz={20}>Servers</Text>
        </UnstyledButton>
        <UnstyledButton
          sx={(theme) => ({
            display: 'flex',
            justifyContent: 'center',
            padding: '0.2rem 1rem',
            borderRadius: 6,
            transition: 'background-color 100ms ease-out',
            '&:hover': {
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            }
          })}
          onClick={() => signOut()}
        >
          <Group>
            <Image
              src={avatar}
              alt={username}
              width={30}
              height={30}
              radius="50%"
            />
            <Text fz={20}>{ username || 'Unknown User' }</Text>
          </Group>
        </UnstyledButton>
      </Group>
    </Stack>
  )
}