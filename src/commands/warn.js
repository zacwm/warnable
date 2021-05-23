// # warnable v3-dev | Command

exports.meta = {
  name: 'warn',
  description: 'Applies a warning to a member',
  options: [
    {
      name: 'user',
      type: 'STRING',
      description: 'The user to warn | @mention or ID',
      required: true,
    },
    {
      name: 'points',
      type: 'INTEGER',
      description: 'The amount of points to add',
      required: true,
    },
    {
      name: 'reason',
      type: 'STRING',
      description: 'The reason they were warned',
      required: false,
    },
  ],
};

const { db } = require('../warnable');

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    db.addWarning(interaction.guildID,
      interaction.options[0].value.match(/\d+/g)[0],
      interaction.options[1].value,
      interaction.options[2].value,
    ).then(async () => {
      await interaction.reply(`${new Date(new Date().toUTCString())}`, { ephemeral: true });
    }).catch(async err => {
      console.err(err);
      await interaction.reply('Something failed!', { ephemeral: true });
    });
  }
};