import * as React from 'react';

import { useSetState } from '@mantine/hooks';
import { Accordion, Stack, Text, Loader, Grid, Button } from '@mantine/core';
import ChannelInput from '../Inputs/ChannelInput';
import RoleInput from '../Inputs/RoleInput';

export default function ServerPageConfig({ server }) {
  const [loadingData, setLoadingData] = React.useState(false);
  const [dataError, setDataError] = React.useState(false);
  const [configData, setConfigData] = React.useState<any>({});
  const [savingData, setSavingData] = React.useState(false);

  const [state, setState] = useSetState({});

  const fetchData = async () => {
    if (loadingData) return;
    if (!server) return;
    setLoadingData(true);
    setDataError(false);
    fetch(`/api/server/${server.id}/config`)
      .then(res => {
        if (res.status === 404) {
          setDataError(true);
          return;
        } else if (!res.ok) {
          throw new Error(`Failed to fetch server data: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setConfigData(data);
        setState(data.configValues);
      })
      .catch(err => {
        console.error(err);
        setDataError(true);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }

  const saveData = async () => {
    if (savingData) return;
    if (!server) return;
    setSavingData(true);
    fetch(`/api/server/${server.id}/config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to save server data: ${res.status}`);
        }
        setSavingData(false);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        fetchData();
      });
  }

  React.useEffect(() => {
    fetchData();
  }, [server]);

  React.useEffect(() => {
    console.dir([loadingData, dataError, configData]);
  }, [loadingData, dataError, configData]);

  return (
    <Stack sx={{ height: '100%' }}>
      <Text fz={30} fw="bold">Config</Text>
      {
        loadingData ? (
          <Stack justify="center" align="center" style={{ flex: 1 }}>
            <Loader size="lg" />
          </Stack>
        ) : dataError || Object.keys(configData?.configItems || {}).length == 0 ? (
          <Text>Failed to load warning data</Text>
        ) : (
          <Stack>
            <Accordion
              variant="separated"
              styles={{
                item: {
                  borderRadius: 12,
                },
              }}
            >
              {
                Object.keys(configData.configItems).map(key => {
                  const categoryState = state[key];
                  return (
                    <Accordion.Item value={key}>
                      <Accordion.Control>
                        <Text fz={18}>{ key }</Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Grid>
                          {
                            configData.configItems[key].map(item => {
                              const value = categoryState ? categoryState[item.key] : undefined;
                              return (
                                <Grid.Col span={6}>
                                  <Text>{ item.name }</Text>
                                  {
                                    ['textChannel', 'voiceChannel'].includes(item.type) ? (
                                      <ChannelInput
                                        channels={server.channels}
                                        filter={item.type}
                                        value={value}
                                        multiple={item.flags?.includes('multiple')}
                                        onChange={value => {
                                          setState(prev => {
                                            return {
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                [item.key]: value
                                              }
                                            }
                                          });
                                        }}
                                      />
                                    ) : item.type === 'role' ? (
                                      <RoleInput
                                        roles={server.roles}
                                        value={value}
                                        serverId={server.id}
                                        excludeEveryone={item.flags?.includes('excludeEveryone')}
                                        multiple={item.flags?.includes('multiple')}
                                        onChange={value => {
                                          setState(prev => {
                                            return {
                                              ...prev,
                                              [key]: {
                                                ...prev[key],
                                                [item.key]: value
                                              }
                                            }
                                          });
                                        }}
                                      />
                                    ) : null
                                  }
                                </Grid.Col>
                              );
                            })
                          }
                        </Grid>
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })
              }
            </Accordion>
            <Button
              size="lg"
              onClick={saveData}
            >
              Save Changes
            </Button>
          </Stack>
        )
      }
    </Stack>
  )
}