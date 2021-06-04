// # warnable v3-dev | Module

const { logs, db } = require('../warnable');

exports.guildMemberAdd = function memberJoin(member) {
  const serverConfig = process.servers[member.guild.id];
  if (serverConfig) {
    if (serverConfig['log-channels'].users) {
      db.listWarnings(member.guild.id, member.user.id)
      .then((v) => {
        logs.guild(member.guild.id, 'users', {
          title: 'User joined',
          description: `<@${member.user.id}> (\`${member.user.id}\`) joined the server.\n**Total points:** ${v.reduce((prev, val) => prev + val.points, 0)}`,
          thumbnail: member.user.avatarURL({ dynamic: true }),
          color: 0x2ecc71,
        });
      })
      .catch(() => {
        logs.guild(member.guild.id, 'users', {
          title: 'User joined',
          description: `<@${member.user.id}> (\`${member.user.id}\`) joined the server.\n*Failed to lookup warning points.*`,
          thumbnail: member.user.avatarURL({ dynamic: true }),
          color: 0x2ecc71,
        });
      });
    }
  }
};

exports.guildMemberRemove = function memberLeave(member) {
  const serverConfig = process.servers[member.guild.id];
  if (serverConfig) {
    if (serverConfig['log-channels'].users) {
      db.listWarnings(member.guild.id, member.user.id)
      .then((v) => {
        logs.guild(member.guild.id, 'users', {
          title: 'User left',
          description: `<@${member.user.id}> (\`${member.user.id}\`) left the server.\n**Total points:** ${v.reduce((prev, val) => prev + val.points, 0)}`,
          thumbnail: member.user.avatarURL({ dynamic: true }),
          color: 0xd35400,
        });
      })
      .catch(() => {
        logs.guild(member.guild.id, 'users', {
          title: 'User left',
          description: `<@${member.user.id}> (\`${member.user.id}\`) left the server.\n*Failed to lookup total warning points.*`,
          thumbnail: member.user.avatarURL({ dynamic: true }),
          color: 0xd35400,
        });
      });
    }
  }
};