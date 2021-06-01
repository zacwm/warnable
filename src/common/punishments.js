/* eslint-disable max-nested-callbacks */
// # warnable v3-dev | Common - Punishments
// Handles checking new point totals or punishment intervals.

const { db, logs, client } = require('../warnable');
const moment = require('moment-timezone');

exports.execute = (guildID, userID, punishmentType, issuer, unix, reason) => {
  return new Promise((resolve, reject) => {
    const serverConfig = process.servers[guildID];
    if (serverConfig) {
      db.addPunishment(
        guildID,
        userID,
        punishmentType,
        issuer || client.user.id,
        unix,
      )
      .then(() => {
        logs.guild(guildID, 'main', {
          title: 'Punishment started',
          description: `**Finishes:** ${(parseInt(unix) !== 0) ? moment().to(moment.unix(parseInt(unix))) : 'never...'}`
          + `\n**Type:** ${punishmentType} **| Issuer:** <@${issuer}>`
          + `\n**Reason:** \`${reason}\``,
          color: 0xe74c3c,
        });

        client.guilds.fetch(guildID)
        .then((g) => {
          g.members.fetch(userID)
          .then(member => {

            // MUTE
            if (punishmentType === 'mute') {
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
            }

            // BAN
            else if (punishmentType === 'ban') {
              member.ban({ reason: reason })
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject({ reason: 'Something failed when trying to ban the member.', catch: rErr });
              });
            }

            // KICK
            else if (punishmentType === 'kick') {
              member.kick(reason)
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject({ reason: 'Something failed when trying to ban the member.', catch: rErr });
              });
            }
            else {
              reject(null);
            }

          })
          .catch((mErr) => {
            reject({ reason: 'Something failed when trying to lookup the member.', catch: mErr });
          });
        })
        .catch((gErr) => {
          reject({ reason: 'Something failed when trying to lookup the server.', catch: gErr });
        });
      })
      .catch((pErr) => {
        reject({ reason: 'Something failed when trying to add the punishment to the database.', catch: pErr });
      });
    }
    else {
      reject({ reason: 'The server isn\'t configured.' });
    }
  });
};

exports.rejoin = (guild, user) => {
  db.listPunishments(guild)
  .then((p) => {
    const punishment = p.find(punish => punish.user === user);
    console.dir(punishment);
  })
  .catch((pErr) => {
    console.error(pErr);
    logs.console('check', `Failed to perform a rejoin check on '${user}' in '${guild}'`);
  });
};

exports.stop = (guild, user, reason) => {
  return new Promise((resolve, reject) => {
    const serverConfig = process.servers[guild];
    if (serverConfig) {
      db.listPunishments(guild)
      .then((p) => {
        const punishment = p.find(punish => punish.user === user);
        db.stopPunishment(guild, user)
        .then(() => {
          client.guilds.fetch(guild)
          .then((g) => {
            if (punishment.type === 'mute') {
              g.members.fetch(user)
              .then((m) => {
                m.roles.remove(serverConfig.roles.mute, reason)
                .then((r) => {
                  resolve(true, r);
                })
                .catch((rErr) => {
                  reject({ reason: 'Something failed trying to remove the mute role from the member.', catch: rErr });
                });
              })
              .catch((mErr) => {
                console.error(mErr);
                reject({ reason: 'Something failed trying to fetch the member.', catch: mErr });
              });
            }
            else if (punishment.type === 'ban') {
              g.bans.remove(user, reason)
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject({ reason: 'Failed to unban the user. Maybe the user was already unbanned?', catch: rErr });
              });
            }
          })
          .catch((gErr) => {
            console.error(gErr);
            reject({ reason: 'Something failed trying to fetch the server.', catch: gErr });
          });
        })
        .catch((cErr) => {
          console.error(cErr);
          reject({ reason: 'Something failed trying to delete the punishment from the database.', catch: cErr });
        });
      })
      .catch((pErr) => {
        console.error(pErr);
        reject({ reason: 'Something unexpected happened trying to find the users punishment.', catch: pErr });
      });
    }
    else {
      reject({ reason: 'This server isn\'t configured.' });
    }
  });
};

exports.check = (guild) => {
  db.listPunishments(guild)
  .then((p) => {
    const finishedPunishments = {};
    p.forEach((punishment) => {
      if (parseInt(punishment.unixFinish) > 0 && parseInt(punishment.unixFinish) <= moment().unix()) {
        if (!finishedPunishments[punishment.guild]) finishedPunishments[punishment.guild] = [];
        finishedPunishments[punishment.guild].push(`- <@${punishment.user}> (${punishment.user}) | ${punishment.type}`);
        this.stop(punishment.guild, punishment.user, '[punish] Temp-timer concluded.');
      }
    });
    for (const server in finishedPunishments) {
      logs.guild(server, 'main', {
        title: `Punishment${finishedPunishments[server].length > 1 ? 's' : ''} finished`,
        description: finishedPunishments[server].join('\n'),
        color: 0x1abc9c,
      });
    }
  })
  .catch((pErr) => {
    console.error(pErr);
    logs.console('check', `Failed to perform a time check for '${guild}' when using db.listPunishments`);
  });
};

exports.pointCheck = (guildID, userID, points, issuer) => {
  const serverConfig = process.servers[guildID];
  if (serverConfig) {
    serverConfig['point-punishments'].every((item) => {
      if (item.range.min <= points && item.range.max >= points) {
        const length = moment(moment().add(parseInt(item.action.length.match(/\d+/g)[0]), item.action.length.match(/\D/g)[0])).unix();
        this.execute(guildID, userID, item.action.type, issuer, length, '[warnable] Point checkpoint reached');
        return;
      }
    });
  }
};