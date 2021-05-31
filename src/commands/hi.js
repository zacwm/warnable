// # warnable v3-dev | Command

const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

exports.meta = {
  name: 'hi',
  description: 'Replies with hello back!',
};

exports.interaction = (interaction) => {
  if (!interaction.isCommand()) return;
	if (interaction.commandName === this.meta.name) {
    console.dir(interaction);
    fetch('http://aws.random.cat/meow')
    .then(res => res.json())
    .then(json => {
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setTitle('Hello! :)')
        .setDescription('Here\'s a cat...')
        .setImage(json.file),
      ] });
    })
    .catch(() => {
      interaction.reply({ embeds: [
        new MessageEmbed()
        .setDescription('Hello! :)'),
      ] });
    });
  }
};