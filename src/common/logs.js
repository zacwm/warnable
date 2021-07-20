// # Warnable v3 | Common - Logs
// Handles logs to the console and/or the guild set log channel.

const { MessageEmbed, WebhookClient } = require('discord.js');
const { client, config } = require('../warnable');

/* @ Console/Webhook Logs */
exports.console = (name, message) => {
  // Always logs to console.
  console.log(`${name.padStart(10)} | ${message}`);

  if (config['console-webhook']) {
    if (!process.WebhookClient) {
      const webhookRegExp = new RegExp(/(http|https):\/\/(canary\.|pbt\.|)discord\.com\/api\/webhooks\/\d+\/.+/);
      if (!webhookRegExp.test(config['console-webhook'])) return;
      const WebhookCredentials = config['console-webhook'].match(/\d+\/.+/g)[0].split('/');
      process.WebhookClient = new WebhookClient(WebhookCredentials[0], WebhookCredentials[1]);
    }
    process.WebhookClient.send({
      content: `**${name}** | ${message}`,
    })
    .catch(() => {
      console.error(`${'webhook'.padStart(10)} | Console Webhook failed to send message.`);
    });
  }
};

/* @ Guild Logs */
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
    .setThumbnail(content.thumbnail)
    .setColor(content.color));
  })
  .catch(() => {
    this.console('logs', `Failed to log to the '${type}' channel for server '${guild}'. Error@Channel`);
  });
});

// Other

/* function discordContentToConsole(str) {

} */