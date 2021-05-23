// # warnable v3-dev | Command

exports.meta = {
  name: 'punish',
  description: 'Applies a punishment to a member',
  options: [
    {
      name: 'user',
      type: 'STRING',
      description: 'The user to punish | @mention or ID',
      required: true,
    },
    {
      name: 'type',
      type: 'STRING',
      description: 'The amount of points to add',
      required: true,
      choices: [
        {
          name: 'Ban',
          value: 'type_ban',
        },
        {
          name: 'Mute',
          value: 'type_mute',
        },
      ],
    },
    {
      name: 'length',
      type: 'STRING',
      description: 'Punishment time length. Leave blank for permanant.',
      required: false,
    },
  ],
};

exports.interaction = async (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    console.dir(interaction);
    await interaction.reply('Hello!');
  }
};