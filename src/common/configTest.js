module.exports = data => new Promise((resolve, reject) => {
	if (!data) {
		reject(new Error('No data was found.'));
	}

	if (typeof data !== 'object') {
		reject(new Error('File failed to parse.'));
	}

	// Roles
	if (!data.roles) {
		reject(new Error('Missing roles properties.'));
	}

	// Log Channels
	if (!data['log-channels']) {
		reject(new Error('Missing log-channels properties.'));
	}

	// Automod
	if (!data.automod) {
		reject(new Error('Missing automod properties.'));
	}

	if (!data.automod.badwords) {
		reject(new Error('Missing automod.badwords properties.'));
	}

	if (!data.automod.invites) {
		reject(new Error('Missing automod.invites properties.'));
	}

	// Point punishments
	if (!data['point-punishments']) {
		reject(new Error('Missing point-punishments properties'));
	}

	if (!Array.isArray(data['point-punishments'])) {
		reject(new Error('point-punishments is not an array.'));
	}

	// If passed
	resolve(true);
});
