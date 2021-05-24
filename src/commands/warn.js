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
    ).then((v) => {
      if (v) interaction.reply(`**${interaction.options[1].value} points** applied to \`${interaction.options[0].value}\`${interaction.options[2] ? ` for \`${interaction.options[2].value}\`` : ''}`, { ephemeral: true });
      else interaction.reply('The warning couldn\'t be applied.', { ephemeral: true });
    }).catch(err => {
      console.err(err);
      interaction.reply('Something failed!', { ephemeral: true });
    });
  }
};