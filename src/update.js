/* eslint-disable quotes */
/* eslint-disable max-nested-callbacks */
// # warnable | v2.x.x to v3.x.x Updater

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const moment = require('moment-timezone');
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
let db;

try {
  const Database = require('./database');
  db = new Database();
}
catch(err) {
  if (err.code === 'MODULE_NOT_FOUND' && err.message.includes('./database')) {
    console.error('No database file was found.');
    console.log(chalk.bgRed('!!! RUN THE FIRST TIME SETUP FIRST AND RUN ONCE BEFORE USING THE UPDATER !!!'));
    console.log('\n\nCheck how to setup on the Warnable Wiki!');
    console.log(chalk.magenta.underline('https://github.com/zacimac/warnable/wiki/Setup'));
  }
  else {
    console.error(err);
    console.error('Database file failed to load. You should report the error above as a GitHub issue.');
    console.log(chalk.magenta.underline('https://github.com/zacimac/warnable/issues'));
  }
  process.exit(0);
}

// Intro
console.log(`                .                                            .\n`
+ `     *   .                  .              .        .   *          .\n`
+ `  .         .                     .       .           .      .        .\n`
+ `        ${chalk.yellow('o')}                             .                   .\n`
+ `         ${chalk.yellow('.')}              .                  .           .\n`
+ `          ${chalk.yellow('0')}     .\n`
+ `                 .          .                 ,                ,    ,\n`
+ ` .          ${chalk.yellow('\\')}          .      ${chalk.bold.blue('Warnable Updater')}         .\n`
+ `      .      ${chalk.yellow('\\')}   ,          ${chalk.green('for v2.x.x to v3.x.x')}\n`
+ `   .          ${chalk.yellow('o')}     .                 .                   .            .\n`
+ `     .         ${chalk.yellow('\\')}         ${chalk.green('github.com/zacimac/warnable')}            .\n`
+ `               ${chalk.yellow('#\\##\\#')}      .                              .        .\n`
+ `             ${chalk.yellow('#  #O##\\###')}                .                        .\n`
+ `   .        ${chalk.yellow('#*#  #\\##\\###')}                       .                     ,\n`
+ `        .   ${chalk.yellow('##*#  #\\##\\##')}               .                     .\n`
+ `      .      ${chalk.yellow('##*#  #o##\\#')}         .                             ,       .\n`
+ `          .     ${chalk.yellow('*#  #\\#')}     .                    .             .          ,\n`
+ `                      ${chalk.yellow('\\')}          .                         .\n`
+ `____^/\\___^--____/\\____${chalk.yellow('O')}______________/\\/\\---/\\___________---______________\n`
+ `   /\\^   ^  ^    ^                  ^^ ^  '\\ ^          ^       ---\n`
+ `         --           -            --  -      -         ---  __       ^\n`
+ `   --  __                      ___--  ^  ^                         --  __\n`);

setTimeout(function() {
  console.log(chalk.bgRed(' ▼ Read Below ▼ Read Below ▼ Read Below ▼ Read Below ▼ Read Below ▼ '));
  console.log('This updater is to update from Warnable version 2.x.x to 3.x.x'
  + '\n\nMake sure you have Warnable all setup and working before using this updater.'
  + '\n\nDue to many changes in DB functionality from version 2.x.x to 3.x.x,'
  + 'this will only support the JSON-DB db used for warnable 2.x.x.'
  + chalk.red('\n\nMOST IMPORTANT >>>>> ')
  + 'If you currently have warnings in your DB for v3.x.x already, BACK IT UP!!!'
  + chalk.bold.blue('\n\nIf you have read above, type \'start\' to start the updater...'));
  readline.question(chalk.yellow('> '), (input) => {
    if (input.toLowerCase() === 'start') {
      if (process.argv[2]) {
        console.log(chalk.bold.green('\nStarting the update...\n\n'));
        setTimeout(function() { parseWarnings(); }, 2000);
      }
      else {
        console.log(chalk.bold.red('No warnable db (JSON) file was specified.\nCheck our update guide on the Warnable Wiki'));
        console.log('https://github.com/zacimac/warnable/wiki/Update');
        process.exit(0);
      }
    }
    else {
      console.log(chalk.bold.red('I don\'t know what that means... :(\nStart the updater again and try again.'));
      process.exit(0);
    }
  });
}, 2000);

// Main
const warningData = [];

function parseWarnings() {
  fs.readFile(path.join(__dirname, '../', process.argv[2]), 'utf-8', (fsErr, data) => {
    if (!fsErr) {
      try {
        data = JSON.parse(data);
        const guilds = Object.keys(data.guilds);
        console.log(chalk.bold.blue(`Now starting parse of all warnings from ${guilds.length} guild${guilds.length > 1 ? 's' : ''}`));
        guilds.forEach((guildID) => {
          const users = Object.keys(data.guilds[guildID].users);
          let totalGuildWarnings = 0;
          users.forEach((userID) => {
            const userData = data.guilds[guildID].users[userID].warnings;
            if (userData) {
              userData.forEach((warning) => {
                const wGuild = guildID;
                const wUser = userID;
                const wPoints = warning.points || 0;
                const wIssuer = warning.issuer || 0;
                const wReason = warning.reason || 'Reason failed to load after update.';
                const wTime = (warning.time ? moment(warning.time, 'MMM Do YYYY, LT').unix() : 0);
                warningData.push({ wGuild, wUser, wPoints, wIssuer, wReason, wTime });
                totalGuildWarnings++;
              });
            }
          });
          console.log(chalk.magenta(`Finished parsing data for guild '${guildID}' | Total warnings: ${totalGuildWarnings}`));
        });
        importWarnings();
      }
      catch(tErr) {
        console.error(tErr);
        console.error(chalk.red('Failed to parse the data... Maybe report this as an issue.'));
        console.log(chalk.magenta.underline('https://github.com/zacimac/warnable/issues'));
        process.exit(0);
      }
    }
    else {
      console.error(fsErr);
      console.error(chalk.red('Failed to read the file... Maybe check if the path is correct.'));
      process.exit(0);
    }
  });
}

function importWarnings() {
  console.log(chalk.bold.blue(`\n\nNow starting DB import of ${warningData.length} warnings...`));
  const totalWarnings = warningData.length;
  function runWarning(warning) {
    db.addWarning(warning.wGuild, warning.wUser, warning.wPoints, warning.wIssuer, warning.wReason, warning.wTime)
    .then(() => {
      console.log(chalk.magenta(`Processed the user '${warning.wUser}' in guild '${warning.wGuild}'`) + chalk.bold.yellow(` | `) + chalk.green(`Processed ${totalWarnings - warningData.length} of ${totalWarnings}`));
      runNext();
    })
    .catch((dbErr) => {
      console.error(dbErr);
      console.log(chalk.red(`FAILED to process the user '${warning.wUser}' in guild '${warning.wGuild}'`) + chalk.bold.yellow(` | `) + chalk.green(`Processed ${totalWarnings - warningData.length} of ${totalWarnings}`));
      runNext();
    });
    function runNext() {
      setTimeout(function() {
        if (warningData.length > 0) {
          runWarning(warningData.shift());
        }
        else {
          console.log(chalk.bold.blue('\n\n      ALL DONE! :)\n\n　　     　 　 ∧_,,∧　　　\n    　♪　　   (・ω・)　　♪\n   ＿＿＿ ＿○＿＿つヾ＿＿\n /δ⊆・⊇ 。/†: :† /δ ⊆・⊇｡ /|\n|￣￣￣￣￣￣￣￣￣￣￣ | |\n|　　　　　　　　　　 　|'));
          process.exit(0);
        }
      // Giving the DB a little time in between warnings lol...
      }, 50);
    }
  }

  setTimeout(function() { runWarning(warningData.shift()); }, 5000);
}