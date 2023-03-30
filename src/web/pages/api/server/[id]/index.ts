import ServerRouteMiddleware from '../../../../middlewares/serverRoute';

async function handler(req, res) {
  const { id } = req.query;

  if (!req.guild) return res.status(500).json({ error: 'Guild not found' });
  if (!req.member) return res.status(500).json({ error: 'Member not found' });

  // Load the guild config
  const modules = req.modules?.modules;
  if (!modules) return res.status(500).json({ error: 'Modules not found' });

  const ConfigerModule = modules['Configer']?.main;
  if (!ConfigerModule) return res.status(500).json({ error: 'Configer module error' });
  const GuildConfig = ConfigerModule.getAllModuleGuildConfigs(id);

  const channels = await req.guild.channels.fetch();
  const roles = await req.guild.roles.fetch();

  const parseTypeNumToString = (type: number) => {
    switch (type) {
      case 0: return 'textChannel';
      case 2: return 'voiceChannel';
      case 4: return 'category';
      default: return 'unknown';
    }
  }

  const guildData = {
    id: req.guild.id,
    name: req.guild.name,
    icon: req.guild.iconURL({ dynamic: true }),
    config: GuildConfig,
    channels: channels.map((c) => ({
      id: c.id,
      name: c.name,
      type: parseTypeNumToString(c.type),
    })),
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      hex: r.hexColor,
      hoist: r.hoist,
      position: r.position,
      permissions: r.permissions,
    })).sort((a, b) => b.position - a.position),
  };

  return res.status(200).json(guildData);
}

export default ServerRouteMiddleware(handler);