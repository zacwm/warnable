// scuffed command because its used for dev stuff.

exports.messageCreate = (msg) => {
  if (msg.author.bot) return;
  if (!msg.content.startsWith('!eval')) return;
  if (!process.env.BOTADMINS.split(',').includes(msg.author.id)) return msg.channel.send('Sorry, you need to be a bot admin to use this command.');
  const evalInput = msg.content.substring(6);
  if (!evalInput) return msg.channel.send('No eval input provided.');
  try {
    const evalOutput = eval(evalInput);
    msg.channel.send(`**Eval completed!**\n**Input**\n\`\`\`js\n${evalInput}\`\`\`\n**Output**\n\`\`\`${evalOutput}\`\`\``);
  }
  catch(evalErr) {
    msg.channel.send(`**Eval ran with errors!**\n**Input**\n\`\`\`js\n${evalInput}\`\`\`\n**Error**\n\`\`\`${evalErr}\`\`\``);
  }
};