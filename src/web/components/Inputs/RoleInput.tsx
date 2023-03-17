import * as React from 'react';

import { Group, MultiSelect, CloseButton, Text } from '@mantine/core';
import { IconCircle } from '@tabler/icons-react';

const RoleDotIcon = (hex: string) => {
  return (
    <IconCircle size={16} color={hex || ''} />
  )
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
        { RoleDotIcon(item.hex) }
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
  const { hex, label, ...others } = props;

  return (
    <div
      ref={ref}
      {...others}
    >
      <Group noWrap>
        { RoleDotIcon(hex) }
        <Text>{label}</Text>
      </Group>
    </div>
  )
});


export default function RoleInput({
  roles,
  multiple,
  value,
  serverId,
  excludeEveryone,
  onChange,
}: {
  roles: any[],
  multiple?: boolean,
  filter?: string,
  value: string,
  serverId: string,
  excludeEveryone?: boolean,
  onChange: any,
}) {
  const handleChange = (val: any) => {
    if (multiple) {
      onChange(val.join(','));
    } else {
      onChange(val[0]);
    }
  }

  if (excludeEveryone) {
    roles = roles.filter(role => role.id !== serverId);
  }

  return (
    <MultiSelect
      placeholder="Select role"
      value={(value || '').split(',')}
      onChange={handleChange}
      itemComponent={SelectItem}
      valueComponent={({ value, onRemove }) => ValueItem(roles.find(i => value === i.id), onRemove)}
      data={roles.map(role => ({
        label: role.name,
        value: role.id,
        hex: role.hex,
      }))}
    />
  )
}