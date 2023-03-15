import * as React from 'react';

import { useSetState } from '@mantine/hooks';
import { Accordion, Stack, Text, Loader, Grid } from '@mantine/core';
import ChannelInput from '../Inputs/ChannelInput';

export default function ServerPageConfig({ server }) {
  const [loadingData, setLoadingData] = React.useState(false);
  const [dataError, setDataError] = React.useState(false);
  const [configData, setConfigData] = React.useState<any>({});

  const [state, setState] = useSetState({ name: 'John', age: 35, job: 'Engineer' });

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
                                <ChannelInput
                                  channels={server.channels}
                                  filter={item.type}
                                  value={value}
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
        )
      }
    </Stack>
  )
}