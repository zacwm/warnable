import * as React from 'react';

import { Accordion, Stack, Text, Loader } from '@mantine/core';
import ChannelInput from '../Inputs/ChannelInput';

export default function ServerPageConfig({ server }) {
  const [loadingData, setLoadingData] = React.useState(false);
  const [dataError, setDataError] = React.useState(false);
  const [configData, setConfigData] = React.useState({});

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
        ) : dataError || Object.keys(configData).length == 0 ? (
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
              Object.keys(configData).map(key => {
                return (
                  <Accordion.Item value={key}>
                    <Accordion.Control>
                      <Text fz={18}>{ key }</Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <ChannelInput
                        channels={[
                          { id: '1', name: 'test', type: 'textChannel' },
                          { id: '2', name: 'hello', type: 'textChannel' },
                          { id: '3', name: 'yes', type: 'voiceChannel' }
                        ]}
                        multiple={true}
                        value={['1', '2']}
                        onChange={value => {
                          console.dir(value);
                        }}
                      />
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