// # Warnable v3 | Common - Logs
// Handles logs to the console and/or the guild set log channel.

const { MessageEmbed, WebhookClient } = require('discord.js');
const { client, config } = require('../warnable');
let consoleWebhookClient;

(() => {
  const webhookRegExp = new RegExp(/(http|https):\/\/(canary\.|pbt\.|)discord\.com\/api\/webhooks\/\d+\/.+/);
  if (!webhookRegExp.test(config['console-webhook'])) return;
  const WebhookCredentials = config['console-webhook'].match(/\d+\/.+/g)[0].split('/');
  consoleWebhookClient = new WebhookClient({ id: WebhookCredentials[0], token: WebhookCredentials[1] });
})();

/* @ Console/Webhook Logs */
exports.console = (name, message) => {
  // Always logs to console.
  console.log(`${name.padStart(10)} | ${message}`);

  if (consoleWebhookClient) {
    consoleWebhookClient.send({
      content: `**${name}** | ${message}`,
    }).then().catch(() => {
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