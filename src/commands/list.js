// # warnable v3-dev | Command

exports.meta = {
  name: 'list',
  description: 'Displays a list of the members warnings.',
  options: [
    {
      name: 'user',
      type: 'STRING',
      description: 'The member to list. | @mention or ID',
      required: true,
    },
  ],
};

const { db } = require('../warnable');

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    db.listWarnings(interaction.guildID,
      interaction.options[0].value.match(/\d+/g)[0],
    ).then((v) => {
      console.dir(v);
      interaction.reply(`Found ${v.length} warnings.`, { ephemeral: true });
    }).catch(err => {
      console.err(err);
      interaction.reply('Something failed!', { ephemeral: true });
    });
  }
};