import * as React from 'react';
import { useRouter } from 'next/router';

import { Stack, Text, Paper, Loader, Table, Button } from '@mantine/core';
import Mention from '../Mention';
import TimeParser from '../TimeParser';

export default function ServerPageWarnings({ server }) {
  const router = useRouter();

  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingError, setLoadingError] = React.useState(false);

  const [warnings, setWarnings] = React.useState([]);

  const loadWarnings = () => {
    if (!server) return;
    setLoadingData(true);
    fetch(`/api/server/${server.id}/warnings`)
      .then(res => {
        if (res.status === 404) {
          setLoadingError(true);
          return;
        } else if (!res.ok) {
          throw new Error(`Failed to fetch server data: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setWarnings(data);
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
  }, [server]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">Warnings</Text>
      {
        loadingData ? (
          <Stack justify="center" align="center" style={{ flex: 1 }}>
            <Loader size="lg" />
          </Stack>
        ) : (
          <Paper
            p="md"
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              width: '100%',
            })}
            radius={12}
          >
            {
              loadingError ? (
                <Text>Failed to load warnings</Text>
              ) : (
                <React.Fragment>
                  <Table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Points</th>
                        <th>Issued By</th>
                        <th>Reason</th>
                        <th>Issued At</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        warnings.map(warning => (
                          <tr key={warning.id}>
                            <td>{warning.id}</td>
                            <td>
                              <Mention
                                userTag={warning.userName}
                                userId={warning.userId}
                              />
                            </td>
                            <td>{warning.points}</td>
                            <td>
                              <Mention
                                userTag={warning.issuerName}
                                userId={warning.issuerId}
                              />
                            </td>
                            <td>{warning.reason}</td>
                            <td>
                              <TimeParser unix={ warning.unixTimestamp } />
                            </td>
                            <td>
                              <Button
                                size="xs"
                                radius={6}
                                onClick={() => router.push(`/server/${server.id}/warning/${warning.id}`)}
                              >
                                View Warning
                              </Button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </Table>
                  { warnings.length === 0 ? (
                    <Stack align="center" p="xl">
                      <Text>No warnings found</Text>
                    </Stack>
                  ) : null }
                </React.Fragment>
              )
            }
          </Paper>
        )
      }
    </Stack>
  )
}