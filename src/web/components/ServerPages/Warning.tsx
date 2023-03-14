import * as React from 'react';
import { useRouter } from 'next/router';

import { Stack, Grid, Text, Paper, Loader } from '@mantine/core';
import Mention from '../Mention';

function WarningItem({ span, label, children }: { span: number, label: string, children?: any }) {
  return (
    <Grid.Col span={span}>
      <Paper
        p="sm"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
          width: '100%',
        })}
        radius={12}
      >
        <Text fw="bold">{ label }</Text>
        { children }
      </Paper>
    </Grid.Col>
  )
}

export default function ServerPageWarning() {
  const router = useRouter();
  const serverQuery = router.query.server;
  const guildId = serverQuery[0];
  const warningId = serverQuery[2];

  const [loadingData, setLoadingData] = React.useState(false);
  const [loadingError, setLoadingError] = React.useState(false);
  const [warningData, setWarningData] = React.useState(null);

  const loadWarnings = () => {
    if (loadingData) return;
    if (!guildId || !warningId) return;
    setLoadingData(true);
    setLoadingError(false);
    fetch(`/api/server/${guildId}/warning/${warningId}`)
      .then(res => {
        if (res.status === 404) {
          setLoadingError(true);
          return;
        } else if (!res.ok) {
          throw new Error(`Failed to fetch warning data: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.dir(data);
        setWarningData(data);
      })
      .catch(err => {
        console.error(err);
        setLoadingError(true);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }

  React.useEffect(() => {
    loadWarnings();
  }, [guildId, warningId]);

  React.useEffect(() => {
    console.dir(warningData);
  }, [warningData]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">Warning ID: { warningId }</Text>
      {
        loadingData ? (
          <Stack justify="center" align="center" style={{ flex: 1 }}>
            <Loader size="lg" />
          </Stack>
        ) : loadingError ? (
          <Text>Failed to load warning data</Text>
        ) : warningData ? (
          <Grid>
            <WarningItem span={6} label="User">
              <Mention
                userTag={warningData.userName}
                userId={warningData.userId}
              />
            </WarningItem>
            <WarningItem span={6} label="Issuer">
            <Mention
                userTag={warningData.issuerName}
                userId={warningData.issuerId}
              />
            </WarningItem>
            <WarningItem span={6} label="Points">
              <Text>{ warningData.points }</Text>
            </WarningItem>
            <WarningItem span={6} label="Issued At">
              <Text>{ warningData.unixTimestamp }</Text>
            </WarningItem>
            <WarningItem span={12} label="Reason">
              <Text>{ warningData.reason }</Text>
            </WarningItem>
          </Grid>
        ) : null
      }
    </Stack>
  )
}