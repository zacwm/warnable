// # Warnable v3 | Common - Logs
// Handles logs to the console and/or the guild set log channel.

module.exports = ((name, message) => {
  console.log(`${name.padStart(10)} | ${message}`);
});