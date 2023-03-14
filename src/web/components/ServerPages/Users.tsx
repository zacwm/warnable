import { Stack, Text, Paper, TextInput, Container } from '@mantine/core';

export default function ServerPageUsers() {
  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">Users</Text>
      <Paper
        p="md"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          width: '100%',
        })}
        radius={12}
      >
        <Stack align="center">
          <Text fz={18}>Lookup a user</Text>
          <TextInput
            placeholder="User ID"
            sx={{ width: '100%', maxWidth: 300 }}
          />
        </Stack>
      </Paper>
    </Stack>
  )
}