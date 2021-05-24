// # warnable v3-dev | Command

const { db } = require('../warnable');

exports.message = (msg) => {
  if (!process.env.BOTADMINS.split(',').includes(msg.author.id)) return;
  const args = msg.content.split(' ');
  if (args[0].toLowerCase() === '!admin') {
    if (args[1] === 'setAdmin') {
      if (args[2]) {
        db.setGuildSetting(msg.guild.id, 'rAdmin', args[2])
        .then(v => {
          console.dir(v);
          msg.channel.send('Done!');
        })
        .catch(err => {
          console.error(err);
          msg.channel.send('Something failed.');
        });
      }
      else {
        msg.channel.send('The admin role ID must be provided.');
      }
    }
  }
};