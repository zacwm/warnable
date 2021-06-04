// # warnable v3-dev | Module

const { logs, client, db } = require('../warnable');
const { pointCheck } = require('../common/punishments');

exports.message = function automod(msg) {
  if (!msg.guild) return;
  if (msg.author.bot) return;

  const serverConfig = process.servers[msg.guild.id];
  if (serverConfig) {
    if (msg.member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) return;

    // Discord Invites
    if (serverConfig.automod.invites.enabled) {
      const inviteCodes = msg.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s/]+?(?=\b)/gm);
      const deleteMessage = inviteCodes.some(function(urls) {
        const parsedInvite = urls.replace(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\//gm, '').split('/')[0];
        return !(serverConfig.automod.invites.excluded || []).includes(parsedInvite);
      });
      if (deleteMessage) {
        msg.delete();
        if (serverConfig.automod.invites.points > 0) {
          const wGuildID = msg.guild.id;
          const wUserID = msg.author.id;
          const wPoints = serverConfig.automod.invites.points || 0;
          const wIssuerID = client.user.id;
          const wReason = `[warnable] Automod - Deleted invite in #${msg.channel.name}`;
          const wTime = (new Date(new Date().toUTCString()).getTime() / 1000).toString();

          db.addWarning(wGuildID, wUserID, wPoints, wIssuerID, wReason, wTime)
          .then(async (v) => {
            if (v) {
              const newList = await db.listWarnings(wGuildID, wUserID);
              const pointTotal = newList.reduce((prev, val) => prev + val.points, 0);
              const descString = `**Warned:** <@${wUserID}> (${wUserID})`
              + `\n**Points:** ${wPoints} point${wPoints !== 1 ? 's' : ''} (New total: ${newList.reduce((prev, val) => prev + val.points, 0) || '?'})`
              + `\n**Reason:** \`${wReason}\``;

              if (pointTotal) pointCheck(wGuildID, wUserID, pointTotal, wIssuerID);

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