import { Stack, Text, Paper } from '@mantine/core';

export default function ServerPageConfig() {
  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">Config</Text>
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