const { client } = require('../warnable');
const moment = require('moment-timezone');

const dobMelone = new Date('February 5, 1999');

exports.isMidnight = isMidnight;
exports.changeNick = changeNick;

function calculate_age() {
    const today = new Date();
    const year = today.getFullYear() - dobMelone.getFullYear();
    const month = today.getMonth() - dobMelone.getMonth();
    const day = today.getDate() - dobMelone.getDate();
    return `[v${year}.${month}.${day}]  `;
}

function changeNick() {
    const melone = client.users.cache.find(user => user.id === '156508402271518720');
    const elyServer = client.guilds.cache.find(guild => guild.id === '191263668305002496');
    const meloneInElyServer = elyServer.member(melone);
    let meloneNick = meloneInElyServer.displayName;
    meloneNick = meloneNick.replace(/\[(.*?)\]/g, '');
    console.log(meloneNick);
    meloneNick += calculate_age();
    meloneInElyServer.setNickname(meloneNick);
}

function isMidnight() {
    const now = moment().tz('Europe/Amsterdam');
    const hour = now.hour();
    const minute = now.minute();
    if(hour === 0 && minute === 0) {
        return true;
    }
    else {
        return false;
    }
}
