import * as React from 'react';

import { useSetState } from '@mantine/hooks';
import { Stack, Text, Paper, Group, Badge, Button, Modal, NumberInput, Tabs, Box, Select, ActionIcon, Textarea } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

const actionTypes = [
  {
    type: 'ban',
    label: 'Ban',
    values: [
      {
        type: 'length',
        label: 'Length',
        required: false,
        valueType: ['seconds'],
      }
    ],
  },
  {
    type: 'kick',
    label: 'Kick',
  },
  {
    type: 'timeout',
    label: 'Timeout/Mute',
    values: [
      {
        type: 'length',
        label: 'Length',
        required: true,
        valueType: 'seconds',
      }
    ],
  },
  {
    type: 'role',
    label: 'Role',
    values: [
      {
        type: 'role',
        label: 'Role',
        required: true,
        valueType: 'role',
      },
      {
        type: 'length',
        label: 'Length',
        required: true,
        valueType: 'seconds',
      },
    ],
  },
  {
    type: 'directMessage',
    label: 'Direct Message',
    values: [
      {
        type: 'message',
        label: 'Message',
        required: true,
        valueType: 'multiline',
      },
    ],
  }
];

function ModalActionItemValues({ type, values, onChange }: { type: string, values: any[], onChange: (value: any) => void }) {
  const actionType = actionTypes.find((action) => action.type === type);
  if (!actionType) return null;

  return (
    <Stack spacing="xs">
      {
        actionType.values ? actionType.values.map((value, index) => (
          <Box key={index}>
            {
              value.valueType == 'seconds' ? (
                <NumberInput
                  label={value.label}
                  value={values?.[index]}
                  min={0}
                  onChange={(value) => onChange({ [index]: value })}
                />
              ) : value.valueType == 'multiline' ? (
                <Textarea
                  label={value.label}
                  value={values?.[index]}
                  onChange={(event) => onChange({ [index]: event.currentTarget.value })}
                />
              ) : value.valueType == 'role' ? (
                <Text>TODO: Role picker</Text>
              ) : (
                <Text>Unknown value type '{value.valueType}'</Text>
              )
            }
          </Box>
        )) : null
      }
    </Stack>
  );
}

function PunishmentModal({ opened, editingData, actions, onDone, onClose }: { opened: boolean, editingData?: any, actions: any[], onDone: (response: any) => void, onClose: () => void }) {
  const [state, setState] = useSetState<any>({});
  const [valueError, setValueError] = useSetState({
    points: undefined,
    actions: undefined,
  });
  const [maxValueTab, setMaxValueTab] = React.useState<string | null>('value');

  // Check if an infinite punishment exists (but not if it's the one being edited)
  const infiniteExists = actions.some((punishment) => {
    if (editingData && punishment === editingData.data) return false;
    return punishment.maxPoints === null;
  });

  React.useEffect(() => {
    // Set state to editingData if it exists.
    if (editingData) {
      setState(editingData.data);
      setMaxValueTab(editingData.data.maxPoints === null ? 'infinite' : 'value');
    } else {
      setState({ minPoints: 0, maxPoints: 0, actions: [] });
      setMaxValueTab('value');
    }
  }, [opened, editingData]);

  React.useEffect(() => {
    // Check if new state values are valid.
    
    // Check minPoints and maxPoints dont overlap with other punishments.
    const minPointsOverlap = actions.some((punishment) => {
      if (editingData && punishment === editingData.data) return false;
      return punishment.minPoints <= state.minPoints && punishment.maxPoints >= state.minPoints;
    });
    const maxPointsOverlap = actions.some((punishment) => {
      if (editingData && punishment === editingData.data) return false;
      return punishment.minPoints <= state.maxPoints && punishment.maxPoints >= state.maxPoints;
    });
    const pointsOverlap = minPointsOverlap || maxPointsOverlap;
    setValueError({ points: pointsOverlap ? 'Min and max points overlap with another punishment' : undefined });

    // Check that minPoints is less than maxPoints.
    if (maxValueTab == 'value' && state.minPoints > state.maxPoints) {
      setValueError({ points: 'Min points cannot be greater than max points' });
    }
  }, [state]);

  React.useEffect(() => {
    // Check for maxPoints tab change and set state accordingly.
    if (maxValueTab === 'infinite') {
      setState({ maxPoints: null });
    } else {
      setState({ maxPoints: 0 });
    }
  }, [maxValueTab]);

  const onDoneClick = () => {
    // Check that all values are valid.
    
    // Check that minPoints exists
    if (!state.minPoints) {
      setValueError({ points: 'Min points is required' });
      return;
    }

    // Check that no value errors exist.
    if (Object.values(valueError).some((value) => value)) return;

    // Send data to onDone.
    onDone({
      editingIndex: editingData?.index,
      data: state,
    });
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editingData ? 'Edit Punishment' : 'Add Punishment'}
      radius={12}
    >
      <Stack>
        <Box
          p="sm"
          sx={
            valueError.points ? {
              border: '1px solid red',
              borderRadius: 12,
            } : {
              border: '1px solid transparent',
            }
          }
        >
          <Text fw="bold">Min Points</Text>
          <NumberInput
            value={state?.minPoints}
            min={0}
            onChange={(value) => setState({ minPoints: value })}
            my="sm"
          />

          <Text fw="bold">Max Points</Text>
          <Tabs value={maxValueTab} onTabChange={setMaxValueTab}>
            <Tabs.List grow>
              <Tabs.Tab value="value">Value</Tabs.Tab>
              <Tabs.Tab value="infinite" disabled={infiniteExists}>Infinite</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="value">
              <NumberInput
                value={state?.maxPoints}
                min={0}
                onChange={(value) => setState({ maxPoints: value })}
                mt="sm"
              />
            </Tabs.Panel>

            <Tabs.Panel value="infinite">
            </Tabs.Panel>
          </Tabs>
        </Box>
        <Stack
          p="sm"
          sx={
            valueError.actions ? {
              border: '1px solid red',
              borderRadius: 12,
            } : {
              border: '1px solid transparent',
            }
          }
        >
          <Group position="apart">
            <Text fw="bold">Actions</Text>
            <ActionIcon
              onClick={() => {
                const newActions = state.actions;
                newActions.push({ type: undefined, value: undefined });
                setState({ actions: newActions });
              }}
            >
              <IconPlus />
            </ActionIcon>
          </Group>
          {
            state.actions?.map((action: any, index: number) => (
              <Box
                sx={(theme) => ({
                  backgroundColor: theme.colors.dark[5],
                  borderRadius: 12,
                })}
                p="xs"
              >
                <Group>
                  <Stack spacing="sm">
                    <Badge variant="filled" radius="xl" mr="sm">{index + 1}</Badge>
                    <ActionIcon
                      onClick={() => {
                        const newActions = state.actions;
                        newActions.splice(index, 1);
                        setState({ actions: newActions });
                      }}
                    >
                      <IconTrash />
                    </ActionIcon>
                  </Stack>
                  <Stack sx={{ flex: 1 }} spacing="xs">
                    <Select
                      label="Action"
                      value={action.type}
                      placeholder="Select an action"
                      onChange={(value) => {
                        const newActions = state.actions;
                        newActions[index].type = value;
                        setState({ actions: newActions });
                      }}
                      data={
                        actionTypes.map((actionType) => ({
                          value: actionType.type,
                          label: actionType.label,
                        }))
                      }
                    />
                    {
                      action.type ? (
                        <ModalActionItemValues
                          type={action.type}
                          values={action.values}
                          onChange={(value) => {
                            const newActions = state.actions;
                            newActions[index].values = value;
                            setState({ actions: newActions });
                          }}
                        />
                      ) : null
                    }
                  </Stack>
                </Group>
              </Box>
            ))
          }
        </Stack>
        <Button onClick={onDoneClick}>{ editingData ? "Save Changes" : "Add Punishment" }</Button>
      </Stack>
      {
        // Check if any errors exist.
        Object.values(valueError).some((value) => value) ? (
          <Text color="red" mt="sm">
            {
              Object.values(valueError).filter((value) => value).map((value, index) => (
                <React.Fragment key={index}>
                  {value}
                  {
                    index !== Object.values(valueError).filter((value) => value).length - 1 ? (
                      <br />
                    ) : null
                  }
                </React.Fragment>
              ))
            }
          </Text>
        ) : null
      }
    </Modal>
  )
}

function ActionItem({ action, index }: { action: any, index: number }) {
  const secondsToReadable = (seconds: string) => {
    const secondsIsNumber = !isNaN(parseInt(seconds));
    if (!secondsIsNumber) return 'Invalid Time';

    const intSeconds = parseInt(seconds);
    const parsed_days = Math.floor(intSeconds / (3600 * 24));
    const parsed_hours = Math.floor((intSeconds % (3600 * 24)) / 3600);
    const parsed_minutes = Math.floor((intSeconds % 3600) / 60);
    const parsed_seconds = Math.floor(intSeconds % 60);

    const text_days = parsed_days > 0 ? `${parsed_days} day${parsed_days > 1 ? 's' : ''}` : '';
    const text_hours = parsed_hours > 0 ? `${parsed_hours} hour${parsed_hours > 1 ? 's' : ''}` : '';
    const text_minutes = parsed_minutes > 0 ? `${parsed_minutes} minute${parsed_minutes > 1 ? 's' : ''}` : '';
    const text_seconds = parsed_seconds > 0 ? `${parsed_seconds} second${parsed_seconds > 1 ? 's' : ''}` : '';

    const readableTime = [text_days, text_hours, text_minutes, text_seconds].filter(Boolean).join(', ');
    return readableTime;
  }

  return (
    <Group>
      <Text fz="lg">{index + 1}.</Text>
      <Paper
        p="sm"
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[0],
          flex: 1,
        })}
        radius={12}
      >
        <Stack spacing="xs">
          {
            action.type === 'ban' && !action?.values?.[0] ? (
              <Text>Permantently ban the user from the server</Text>
            ) : action.type === 'ban' && action?.values?.[0] ? (
              <Text>Ban the user from the server for {secondsToReadable(action.values?.[0])}</Text>
            ) : action.type === 'kick' ? (
              <Text>Kick the user from the server</Text>
            ) : action.type === 'timeout' ? (
              <Text>Timeout the user from the server for {secondsToReadable(action.values?.[0])}</Text>
            ) : action.type === 'role' ? (
              <Text>Give the user the role {action.values?.[0]}</Text>
            ) : action.type === 'directMessage' ? (
              <React.Fragment>
                <Text>Direct message the user:</Text>
                <Text
                  sx={(theme) => ({
                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[0],
                    borderRadius: 12,
                  })}
                  p="xs"
                >{action?.values?.[0] || 'unknown'}</Text>
              </React.Fragment>
            ) : null
          }
        </Stack>
      </Paper>
    </Group>
  )
}

export default function ServerPagePunishments({ server }) {
  const [state, setState] = useSetState({ items: [] });

  const [punishmentModalOpen, setPunishmentModalOpen] = React.useState(false);
  const [editPunishData, setEditPunishData] = React.useState(null);
  const [changesMade, setChangesMade] = React.useState(false);

  React.useEffect(() => {
    fetch(`/api/server/${server.id}/actions`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .then((data) => {
        setState({ items: data.ranges });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const saveActions = () => {
    // Make POST request to save actions
    fetch(`/api/server/${server.id}/actions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state.items)
    })
      .then((response) => {
        if (response.ok) {
          setChangesMade(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return (
    <Stack sx={{ height: '100%' }}>
      <PunishmentModal
        opened={punishmentModalOpen}
        editingData={editPunishData}
        actions={state.items}
        onDone={(response) => {
          setEditPunishData(null);
          const editingIndex = response.editingIndex;
          if (editingIndex === null || editingIndex === undefined) {
            const newState = [...state.items, response.data];
            newState.sort((a, b) => a.minPoints - b.minPoints);
            setState({
              items: newState
            });
          } else {
            const newItems = [...state.items];
            newItems[editingIndex] = response.data;
            newItems.sort((a, b) => a.minPoints - b.minPoints);
            setState({
              items: newItems
            });
          }
          setChangesMade(true);
        }}
        onClose={() => {
          setEditPunishData(null);
          setPunishmentModalOpen(false);
        }}
      />
      <Group position="apart">
        <Text fz={30} fw="bold">Actions</Text>
        <ActionIcon onClick={() => setPunishmentModalOpen(true)}>
          <IconPlus />
        </ActionIcon>
      </Group>
      {
        state.items.map((item, index) => (
          <Paper
            p="md"
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              width: '100%',
            })}
            radius={12}
          >
            <Stack>
              <Group position="apart">
                {
                  item.maxPoints === null ? (
                    <Text fz="lg"><Text fw="bold" span>{item.minPoints}</Text> or <Text fw="bold" span>more</Text> points</Text>
                  ) : item.minPoints == item.maxPoints ? (
                    <Text fz="lg"><Text fw="bold" span>{item.minPoints}</Text> points</Text>
                  ) : (
                    <Text fz="lg">Between <Text fw="bold" span>{item.minPoints}</Text> to <Text fw="bold" span>{item.maxPoints}</Text> points</Text>
                  )
                }
                <Group>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditPunishData({
                        index,
                        data: item,
                      });
                      setPunishmentModalOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setState({
                        items: state.items.filter((_, i) => i !== index),
                      });
                      setChangesMade(true);
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Group>
              <Stack>
                {
                  item.actions.map((action, index) => (
                    <ActionItem action={action} index={index} />
                  ))
                }
              </Stack>
            </Stack>
          </Paper>
        ))
      }
      {
        changesMade ? (
          <Button
            size="lg"
            mt="md"
            onClick={saveActions}
          >
            Save Actions
          </Button>
        ) : null
      }
    </Stack>
  )
}