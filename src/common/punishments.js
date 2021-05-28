// # warnable v3-dev | Common - Punishments
// Handles checking new point totals or punishment intervals.

const { db, logs, client } = require('../warnable');

exports.execute = ((guildID, userID, punishmentType, reason) => {
  return new Promise((resolve, reject) => {
    db.getGuild(guildID)
    .then((dbg) => {
      if (dbg) {
        client.guilds.fetch(guildID)
        .then((g) => {
          g.members.fetch(userID)
          .then(member => {
            if (punishmentType === 'mute') {
              member.roles.add(dbg.rMute, reason)
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject(rErr);
              });
            }
            else if (punishmentType === 'ban') {
              member.ban({ reason: reason })
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject(rErr);
              });
            }
            else if (punishmentType === 'kick') {
              member.kick(reason)
              .then((r) => {
                resolve(true, r);
              })
              .catch((rErr) => {
                reject(rErr);
              });
            }
            else {
              reject(null);
            }
          })
          .catch((mErr) => {
            reject(mErr);
          });
        })
        .catch((gErr) => {
          reject(gErr);
        });
      }
      else {
        reject(null);
      }
    })
    .catch((dbgErr) => {
      reject(dbgErr);
    });
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
    logs('check', `Failed to perform a rejoin check on '${user}' in '${guild}'`);
  });
});

exports.check = ((guild) => {
  db.listPunishments(guild)
  .then((p) => {
    p.forEach((punishment) => {
      console.dir(punishment.unixFinish);
    });
  })
  .catch((pErr) => {
    console.error(pErr);
    logs('check', `Failed to perform a time check for '${guild}' when using db.listPunishments`);
  });
});