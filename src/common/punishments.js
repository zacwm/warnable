/* eslint-disable max-nested-callbacks */
// # warnable v3-dev | Common - Punishments
// Handles checking new point totals or punishment intervals.

const { client } = require('../warnable');
const logs = require('../common/logs');
const Punishments = require('../database/Punishments');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

exports.execute = (guildID, userID, issuerID, type, reason, unixFinish) => {
  return new Promise((resolve, reject) => {
    const serverConfig = process.servers[guildID];
    if (!serverConfig) return reject({ reason: 'The server isn\'t configured.' });
    Punishments.findOne({ where: { guildID: guildID, userID: userID } })
    .then((val) => {
      if (val !== null) return reject({ message: 'This user already has an active punishment.' });
      const data = {
        guildID: guildID,
        userID: userID,
        type: type,
        issuerID: issuerID,
        unixFinish: unixFinish,
      };
      Punishments.create(data)
      .then(() => {
        logs.guild(guildID, 'main', {
          title: 'Punishment started',
          description: `**User:** <@${userID}> (${userID})`
          + `\n**Finishes:** ${(parseInt(unixFinish) !== 0) ? `<t:${unixFinish}:R>` : 'never...'}`
          + `\n**Type:** ${type} **| Issuer:** <@${issuerID}>`
          + `\n**Reason:** \`${reason}\``,
          color: 0xe74c3c,
        });

        runGuildEvents(guildID, userID, type, reason)
        .then(() => { resolve(true); })
        .catch((err) => { reject({ message: 'Something failed when trying to perform the punishment action on the member.', error: err }); });
      })
      .catch((err) => {
        reject({ message: 'Something failed when trying to put the punishment in the database.', error: err });
      });
    })
    .catch((err) => {
      reject({ message: 'Something failed when trying to read from the database.', error: err });
    });
  });
};


exports.rejoin = async (guildID, userID) => {
  const userPunishment = await Punishments.findOne({ where: { guildID, userID } });
  if (!userPunishment) return;
  runGuildEvents(guildID, userID, userPunishment.type, 'Rejoin with active punishment')
  .then(() => {
    logs.guild(guildID, 'main', {
      title: 'Rejoined punishment',
      description: `The user <@${userID}> (${userID}) has rejoined the server with an active punishment.\n**Type:** ${userPunishment.type}\n\n**Their punishment was applied again.**`,
      color: 0xd35400,
    });
  })
  .catch((err) => {
    console.warn(err);
  });
};

// Stops a punishment that is stored in the DB.
exports.stop = (guildID, userID, reason) => {
  // Look... I want to use await's but ffs...
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const serverConfig = process.servers[guildID];
    if (!serverConfig) return reject({ reason: 'This server isn\'t configured.' });
    const userPunishment = await Punishments.findOne({ where: { guildID, userID } });
    if (!userPunishment) return;
    const guild = await client.guilds.fetch(guildID);
    switch (userPunishment.type) {
      // Mute
      case 0:
        // eslint-disable-next-line no-case-declarations
        const member = await guild.members.fetch(userID);
        member.roles.remove(serverConfig.roles.mute, reason)
        .then((r) => {
          resolve(true, r);
        })
        .catch((rErr) => {
          reject({ reason: 'Something failed trying to remove the mute role from the member.', catch: rErr });
        });
        break;

      // Ban
      case 1:
        guild.bans.remove(userID, reason)
        .then((r) => {
          resolve(true, r);
        })
        .catch((rErr) => {
          reject({ reason: 'Failed to unban the user. Maybe the user was already unbanned?', catch: rErr });
        });
        break;

      default:
        reject({ reason: 'Punishment encountered an unknown punishment type.' });
    }
  });
};

exports.check = async (guild) => {
  const guildPunishments = await Punishments.findAll({ where: { guildID: guild } });
  const filteredPunishments = guildPunishments.filter(punishment => parseInt(punishment.unixFinish) > 0 && parseInt(punishment.unixFinish) <= moment().unix());
  if (filteredPunishments.length < 1) return;
  const finishedPunishments = {};
  // Check if the punishment is due to be stopped.
  filteredPunishments.forEach(punishment => {
    if (!finishedPunishments[guild]) finishedPunishments[guild] = [];
    this.stop(guild, punishment.user, '[warnable] Temp punishment timer finished.')
    .then(() => {
      finishedPunishments.push(`✅ <@${punishment.user}> (${punishment.user}) **| Type:** ${punishment.type}`);
    })
    .catch(() => {
      finishedPunishments.push(`⚠️ <@${punishment.user}> (${punishment.user}) **| Type:** ${punishment.type}`);
    });
  });
  for (const server in finishedPunishments) {
    logs.guild(server, 'main', {
      title: `Punishment${finishedPunishments[server].length > 1 ? 's' : ''} finished`,
      description: finishedPunishments[server].join('\n'),
      color: 0x1abc9c,
    });
  }
};

exports.pointCheck = (guildID, userID, points, issuer) => {
  const serverConfig = process.servers[guildID];
  if (!serverConfig) return;
  for (let i = 0; i < serverConfig['point-punishments'].length; i++) {
    const item = serverConfig['point-punishments'][i];
    if (!(item.range.min <= points && (item.range.max > 0 ? item.range.max : Infinity) >= points)) continue;
    if (item['direct-message']) {
      const doExecute = () => {
        this.execute(
          guildID,
          userID,
          item.action.type,
          issuer,
          item.action.length ? moment(moment().add(parseInt(item.action.length.match(/\d+/g)[0]), item.action.length.match(/\D/g)[0])).unix() : 0,
          '[warnable] Point checkpoint reached',
        )
        .then(() => {
          logs.console('punish', `Punishment started for '${userID}' in '${guildID}'`);
        })
        .catch((executeErr) => {
          console.error(executeErr);
          logs.console('error', `Execute failed for '${userID}' in '${guildID}'`);
        });
      };

      client.guilds.fetch(guildID)
      .then((g) => {
        g.members.fetch(userID)
        .then(member => {
          member.user.send(new MessageEmbed()
          .setTitle(item['direct-message'].title)
          .setDescription(item['direct-message'].body)
          .setColor(0xe74c3c))
          .then(() => {
            doExecute();
          })
          .catch((sErr) => {
            doExecute();
            console.error(sErr);
            logs.console('error', 'Failed to send a message to the member when performing a punishment DM.');
          });
        })
        .catch((mErr) => {
          console.error(mErr);
          logs.console('error', 'Failed to fetch the member when performing a punishment DM.');
        });
      })
      .catch((gErr) => {
        console.error(gErr);
        logs.console('error', 'Failed to fetch the guild when performing a punishment DM.');
      });
    }
    break;
  }
};

// Run by the initial punishment and rejoin check.
function runGuildEvents(guildID, userID, punishmentType, reason) {
  return new Promise((resolve, reject) => {
    client.guilds.fetch(guildID)
    .then((g) => {
      const serverConfig = process.servers[guildID];
      g.members.fetch(userID)
      .then(member => {
        switch (punishmentType) {
          // Mute
          case 0:
            if (serverConfig.roles.mute) {
              member.roles.add(serverConfig.roles.mute, reason)
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject({ reason: 'Something failed when trying to add the mute role to the member.', catch: rErr });
              });
            }
            else {
              reject({ reason: 'No mute role is configured for this server.' });
            }
            break;

          // Ban
          case 1:
            member.ban({ reason: reason })
            .then((r) => {
              resolve(true, r);
            })
            .catch((rErr) => {
              reject({ reason: 'Something failed when trying to ban the member.', catch: rErr });
            });
            break;

          // Kick
          case 2:
            member.kick(reason)
            .then((r) => {
              resolve(true, r);
            })
            .catch((rErr) => {
              reject({ reason: 'Something failed when trying to ban the member.', catch: rErr });
            });
            break;

          default:
            reject({ reason: 'Punishment encountered an unknown punishment type.' });
        }
      })
      .catch((mErr) => {
        reject({ reason: 'Something failed when trying to lookup the member.', catch: mErr });
      });
    })
    .catch((gErr) => {
      reject({ reason: 'Something failed when trying to lookup the server.', catch: gErr });
    });
  });
}