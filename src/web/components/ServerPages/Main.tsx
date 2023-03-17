import { Stack, Text, Paper, Grid, Group } from '@mantine/core';

const GridItem = ({ span, children }) => {
  return (
    <Grid.Col span={span}>
      <Paper
        p="md"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          width: '100%',
        })}
        radius={12}
      >
        { children }
      </Paper>
    </Grid.Col>
  )
}

export default function ServerPageMain({ server }) {
  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">{ server.name }</Text>
      <Grid>
        <GridItem span={4}>
          <Group position="apart">
            <Text fz={26}>Warnings</Text>
            <Text fz={20}>3,756</Text>
          </Group>
        </GridItem>
        <GridItem span={4}>
          <Group position="apart">
            <Text fz={26}>Last Warning</Text>
            <Text fz={20}>3h ago</Text>
          </Group>
        </GridItem>
        <GridItem span={4}>
          <Group position="apart">
            <Text fz={26}>Active Punishments</Text>
            <Text fz={20}>12</Text>
          </Group>
        </GridItem>
      </Grid>
    </Stack>
  )
}