const Warnings = require('../database/Warnings');
const logs = require('../common/logs');
const { pointCheck } = require('../common/punishments');

exports.newWarning = async (data) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    await Warnings.sync();
    Warnings.create(data)
    .then(async () => {
      const newUserData = await Warnings.findAll({ where: { userID: data.userID } });
      const pointTotal = newUserData.reduce((prev, val) => prev + val.points, 0);
      const descString = `**Warned:** <@${data.userID}> (${data.userID})`
      + `\n**Points:** ${data.points} point${data.points !== 1 ? 's' : ''} (New total: ${pointTotal || '?'})`
      + `\n**Reason:** \`${data.reason}\``;

      if (pointTotal && data.points > 0) pointCheck(data.guildID, data.userID, pointTotal, data.issuerID);

      logs.guild(data.guildID, 'main', {
        title: 'New warning',
        description: descString + `\n**Issuer:** <@${data.issuerID}>`,
        color: 0xf39c12,
      });

      resolve(descString);
    })
    .catch((err) => {
      reject(err);
    });
  });
};