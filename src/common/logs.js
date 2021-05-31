// # Warnable v3 | Common - Logs
// Handles logs to the console and/or the guild set log channel.

const { MessageEmbed } = require('discord.js');
const { client } = require('../warnable');

exports.console = ((name, message) => {
  console.log(`${name.padStart(10)} | ${message}`);
});

exports.guild = ((guild, type, content) => {
  const guildData = process.servers[guild];
  if (!guildData) return;
  const channelID = guildData['log-channels'][type];
  if (!channelID) return;
  client.channels.fetch(channelID)
  .then((c) => {
    content = content || {};
    c.send(new MessageEmbed()
    .setTitle(content.title)
    .setDescription(content.description)
    .setThumbnail(content.setThumbnail)
    .setColor(content.color));
  })
  .catch(() => {
    this.console('logs', `Failed to log to the '${type}' channel for server '${guild}'. Error@Channel`);
  });
});

// Other

/* function discordContentToConsole(str) {

} */