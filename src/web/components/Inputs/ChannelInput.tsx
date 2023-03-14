import * as React from 'react';

import { Group, MultiSelect, CloseButton, Text } from '@mantine/core';
import { IconHash, IconVolume2 } from '@tabler/icons-react';

const ChannelIcon = (type: string) => {
  switch (type) {
    case 'textChannel':
      return <IconHash size={16} />;
    case 'voiceChannel':
      return <IconVolume2 size={16} />;
  }
}

const ValueItem = (item, onRemove) => {
  return (
    <div>
      <Group
        noWrap
        sx={(theme) => ({ 
          backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0],
          borderRadius: 6,
          padding: '2px',
          marginRight: '8px',
        })}
        spacing={6}
      >
        { ChannelIcon(item.type) }
        <Text>{item.name}</Text>
        <CloseButton
          onMouseDown={onRemove}
          variant="transparent"
          size={22}
          iconSize={14}
          tabIndex={-1}
        />
      </Group>
    </div>
  )
}

const SelectItem = React.forwardRef((props: any, ref: any) => {
  const { type, label, ...others } = props;

  return (
    <div
      ref={ref}
      {...others}
    >
      <Group noWrap>
        { ChannelIcon(type) }
        <Text>{label}</Text>
      </Group>
    </div>
  )
});


export default function ChannelInput({ channels, multiple, filter, value, onChange }: { channels: any[], multiple?: boolean, filter?: string, value: string[] | string, onChange: any }) {
  const filteredChannels = channels.filter(channel => {
    if (filter === 'textChannel') {
      return channel.type === 'textChannel';
    } else if (filter === 'voiceChannel') {
      return channel.type === 'voiceChannel';
    }
    return true;
  });

  const handleChange = (val: any) => {
    if (multiple) {
      onChange(val);
    } else {
      onChange(val[0]);
    }
  }

  return (
    <MultiSelect
      placeholder="Select channel"
      value={Array.isArray(value) ? value : [value]}
      onChange={handleChange}
      itemComponent={SelectItem}
      valueComponent={({ value, onRemove }) => ValueItem(channels.find(i => value === i.id), onRemove)}
      data={filteredChannels.map(channel => ({
        label: channel.name,
        value: channel.id,
        type: channel.type,
      }))}
    />
  )
}