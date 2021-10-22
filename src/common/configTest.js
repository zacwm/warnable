module.exports = data => new Promise((resolve, reject) => {
	if (!data) return reject(new Error('No data was found.'));

	if (typeof data !== 'object') return reject(new Error('File failed to parse.'));

	// Roles
	if (!data.roles) return reject(new Error('Missing roles properties.'));

	// Log Channels
	if (!data['log-channels']) return reject(new Error('Missing log-channels properties.'));

	// Automod
	if (!data.automod) return reject(new Error('Missing automod properties.'));

	if (!data.automod.badwords) return reject(new Error('Missing automod.badwords properties.'));

	if (!data.automod.invites) return reject(new Error('Missing automod.invites properties.'));

	// Point punishments
	if (!data['point-punishments']) return reject(new Error('Missing point-punishments properties'));

	if (!Array.isArray(data['point-punishments'])) return reject(new Error('point-punishments is not an array.'));

	// If passed
	resolve(true);
});
