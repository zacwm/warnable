import { Stack, UnstyledButton, Group, Text, Image } from '@mantine/core';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') return null;

  if (session?.user) {
    return (
      <UnstyledButton
        onClick={() => signOut()}
        sx={(theme) => ({
          display: 'flex',
          padding: '0.5rem 1rem',
          borderRadius: 6,
          transition: 'background-color 100ms ease-out',
          '&:hover': {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
          }
        })}
      >
        <Group>
          {
            session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name}
                width={50}
                height={50}
                radius="50%"
              />
            ) : null
          }
          <Stack spacing={0}>
            <Text fz={16}>Logged in as</Text>
            <Text fz={20} fw={600}>Zachary#0001</Text>
          </Stack>
        </Group>
      </UnstyledButton>
    )
  }

  return (
    <UnstyledButton
      onClick={() => signIn('discord')}
      sx={(theme) => ({
        display: 'flex',
        padding: '0.5rem 1rem',
        borderRadius: 6,
        transition: 'color 100ms ease-out',
        backgroundColor: '#5865f2',
        '&:hover': {
          color: "#fff"
        }
      })}
    >
      <Text fz={20} fw={700}>Login to Discord</Text>
    </UnstyledButton>
  )
}