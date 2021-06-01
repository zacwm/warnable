// # warnable v3-dev | Module

const { logs, client, db } = require('../warnable');

exports.message = function automod(msg) {
  if (!msg.guild) return;
  if (msg.author.bot) return;

  const serverProps = process.servers[msg.guild.id];
  if (serverProps) {
    if (msg.member.roles.cache.find(role => role.id === serverProps.roles.immune)) return;

    // Discord Invites
    // regex is too hard 4 me, need to fix later.
    if (serverProps.automod.invites.enabled) {
      if (/.*discord(.*(gg|com|app\.com))\S?([A-Za-z0-9]+){1}.*/g.test(msg.content)) {
        msg.delete();
        if (serverProps.automod.invites.points > 0) {
          const wGuildID = msg.guild.id;
          const wUserID = msg.author.id;
          const wPoints = serverProps.automod.invites.points || 0;
          const wIssuerID = client.user.id;
          const wReason = `[warnable] Automod - Deleted invite in #${msg.channel.name}`;

          db.addWarning(wGuildID, wUserID, wPoints, wIssuerID, wReason)
          .then(async (v) => {
            if (v) {
              const newList = await db.listWarnings(wGuildID, wUserID);
              const descString = `**Warned:** <@${wUserID}> (${wUserID})`
              + `\n**Points:** ${wPoints} point${wPoints !== 1 ? 's' : ''} (New total: ${newList.reduce((prev, val) => prev + val.points, 0) || '?'})`
              + `\n**Reason:** \`${wReason}\``;

              logs.guild(msg.guild.id, 'main', {
                title: 'Automod warning',
                description: descString + `\n**Issuer:** <@${wIssuerID}>`,
                color: 0xe67e22,
              });
            }
          }).catch(vErr => {
            console.error(vErr);
          });
        }
      }
    }
  }
};