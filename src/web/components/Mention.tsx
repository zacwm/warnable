import * as React from 'react';

import { Popover, Stack, Text } from '@mantine/core';

export default function Mention({ userTag, userId }: { userTag?: string, userId: string }) {
  return (
    <Popover width={250} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <Text
          sx={{
            cursor: 'pointer',
            backgroundColor: '#16395a',
            padding: '0 4px',
            borderRadius: 6,
            width: 'fit-content',
          }}
        >
          { userTag ? `@${userTag?.split('#')[0]}` : userId }
        </Text>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          { userTag ? (<Text fz={20}>{ userTag }</Text>) : null }
          <Text size="sm">User ID: { userId }</Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  )
}