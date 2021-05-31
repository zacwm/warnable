/* eslint-disable max-nested-callbacks */
// # warnable v3-dev | Common - Punishments
// Handles checking new point totals or punishment intervals.

const { db, logs, client } = require('../warnable');
const moment = require('moment-timezone');

exports.execute = ((guildID, userID, punishmentType, issuer, unix, reason) => {
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
        client.guilds.fetch(guildID)
        .then((g) => {
          g.members.fetch(userID)
          .then(member => {
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
            else if (punishmentType === 'ban') {
              member.ban({ reason: reason })
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject({ reason: 'Something failed when trying to ban the member.', catch: rErr });
              });
            }
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
});

exports.rejoin = ((guild, user) => {
  db.listPunishments(guild)
  .then((p) => {
    const punishment = p.find(punish => punish.user === user);
    console.dir(punishment);
  })
  .catch((pErr) => {
    console.error(pErr);
    logs.console('check', `Failed to perform a rejoin check on '${user}' in '${guild}'`);
  });
});

exports.stop = ((guild, user, reason) => {
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
});

exports.check = ((guild) => {
  db.listPunishments(guild)
  .then((p) => {
    p.forEach((punishment) => {
      if (parseInt(punishment.unixFinish) <= moment().unix()) {
        this.stop(punishment.guild, punishment.user, '[punish] Temp-timer concluded.');
      }
    });
  })
  .catch((pErr) => {
    console.error(pErr);
    logs.console('check', `Failed to perform a time check for '${guild}' when using db.listPunishments`);
  });
});