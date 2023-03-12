import { Avatar } from '@mantine/core';

export default function ServerIcon({ guildId, iconId, guildName, size }: { guildId: string; iconId?: string; guildName: string, size?: number }) {
  const firstLetters = guildName.split(' ').map((word) => word[0]);

  return (
    <Avatar
      src={iconId ? `https://cdn.discordapp.com/icons/${guildId}/${iconId}.png` : undefined}
      alt={guildName}
      radius="xl"
      color="blue"
      size={size}
    >
      { firstLetters }
    </Avatar>
  );
}