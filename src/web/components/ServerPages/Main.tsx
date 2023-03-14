import { Stack, Text, Paper } from '@mantine/core';

export default function ServerPageMain() {
  return (
    <Stack>
      <Text fz={30} fw="bold">Main</Text>
      <Paper
        p="md"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          width: '100%',
        })}
        radius={12}
      >

      </Paper>
    </Stack>
  )
}