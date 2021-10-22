// # warnable v3-dev | Module

const { client } = require('../warnable');
const { MessageEmbed } = require('discord.js');
const Warnings = require('../common/warnings');

exports.messageCreate = checkMessage;
exports.messageUpdate = function messageUpdate(_msgOld, msgNew) {
  checkMessage(msgNew);
};

// Check message
function checkMessage(msg) {
  if (!msg.guild) return;
  if (msg.author.bot) return;

  const serverConfig = process.servers[msg.guild.id];
  if (serverConfig) {
    if (msg.member.roles.cache.find(role => [serverConfig.roles.admin, serverConfig.roles.moderator].includes(role.id)) !== undefined) return;

    // Discord Invites
    if (serverConfig.automod.invites.enabled) {
      const inviteCodes = msg.content.match(/(https?:\/\/)?(www.)?(discord.(gg|io|me|li)|discordapp.com\/invite)\/[^\s/]+?(?=\b)/gm);
      if (inviteCodes) {
        // Should probbaly do a check for an actual discord domain invite for checking if whitelisted.
        // I'll get around to it at some point...
        for (let i = 0; i < inviteCodes.length; i++) {
          client.fetchInvite(inviteCodes[i])
          .then((res) => {
            if (res.guild) {
              if (!serverConfig.automod.invites.excluded.includes(res.guild.id)) {
                runAutomod(msg, 'invites', inviteCodes[i]);
              }
            }
            else {
              runAutomod(msg, 'invites', 'Unknown');
            }
          })
          .catch(() => {
            runAutomod(msg, 'invites', 'Unknown');
          });
        }
      }
    }

    // Disallowed words
    if (serverConfig.automod.badwords.enabled && serverConfig.automod.badwords.excluded) {
      // as a side-effect of hot-reloading, this gets cleared when the config is reloaded. otherwise we'd have to check whether the config has been
      // reloaded. This could probably be better handled elsewhere (root of the file, forEach(server) and generate the regex, and have a listener/callback
      // function handle regenerating when the config is reloaded).
      if (!serverConfig.automod.badwords.regexp) {
        serverConfig.automod.badwords.regexp = new RegExp('(?:^|[\\s!-@])(' + serverConfig.automod.badwords.excluded.join('|') + ')(?:$|[\\s!-@])');
      }
      const match = msg.content.match(serverConfig.automod.badwords.regexp);
      if (match) {
        runAutomod(msg, 'badwords', match[1]);
      }
    }
  }
}


// Run Automod delete and warn
function runAutomod(msg, type, reasonExtras) {
  const automodTypeProps = process.servers[msg.guild.id].automod[type];
  // Reply to member
  if (automodTypeProps.reply) {
    msg.reply({ embed: new MessageEmbed()
      .setDescription(automodTypeProps.reply.replace('{@user}', `<@${msg.author.id}>`))
      .setColor(0xe74c3c),
    })
    .then(() => {
      msg.delete();
    })
    .catch(() => {
      msg.delete();
    });
  }
  else {
    msg.delete();
  }
  // Add warning
  if (automodTypeProps.points) {
    const data = {
      guildID: msg.guild.id,
      userID: msg.author.id,
      points: automodTypeProps.points || 0,
      issuerID: client.user.id,
      reason: '[warnable] Automod' + (type == 'invites' ? `Discord invite (${reasonExtras}) in #${msg.channel.name}` : ''),
      unixTime: (new Date(new Date().toUTCString()).getTime() / 1000).toString(),
    };

    Warnings.newWarning(data)
    .catch((err) => {
      console.warn(err);
    });
  }
}