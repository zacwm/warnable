// Warnable 2.0.0 - Updater (Convert Warnable 1.0.0 warnings for 2.0.0)

var settings = {
    guild: "", // The Discord Server ID to add the warnings to.
    points: 1, // Warning points for each warning added.
    delay: 500, // Delay (in milliseconds) between adding warnings. This is for if you don't want to abuse your db.
}

const colors = require("colors");
const fs = require("fs");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const Database = require("./db");
const db = new Database();

let startupLog = "Warnable Updater - Convert Warnable 1.0.0 for 2.0.0";
console.log(`　　　　　　 ∧＿∧　\n　　　　　（｡･ω･｡)つ━☆・*。\n　　　　　⊂　　 ノ 　　　・゜+.\n　　　　　　しーＪ　　　°。+ *´¨)\n　　　　　　　　　　　　　　.· ´¸.·*´¨) ¸.·*¨)\n　　　　　　　　　　　　　　　(¸.·´ (¸.·'* ☆\n　　　Warnable - www.github.com/zacimac/warnable`.cyan.bold)
console.log(`╔${"═".repeat(startupLog.length + 2)}╗`.magenta.bold);
console.log(`║ ${startupLog} ║`.magenta.bold);
console.log(`╚${"═".repeat(startupLog.length + 2)}╝\n `.magenta.bold);

setTimeout(() => {
    readline.question(`${"▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼".yellow.bold.underline}\n\n${"This process will merge the Warnable 1.0.0 database with your Warnable 2.0.0 database (db.js).\nBecause Warnable 1.0.0 didn't support mutliple servers, this updater can only update warnings to one server.\nWarning points didn't exist in Warnable 1.0.0, so it will apply the same warning points set in the settings to every warning.\nWarning times are will be inaccurate too, as they are handled by the DB module and not the updater.".white}\n\n${"!!! MAKE SURE YOU SET SETTINGS FIRST (in update.js) OTHERWISE IT WILL BREAK !!!".brightWhite.bgRed}\n\n${"IF YOU HAVE A DATABASE ALREADY, PLEASE MAKE A BACKUP OF YOUR DATABASE\nTHIS OPERATION CAN NOT BE UNDONE!".brightWhite.bgRed}\n${"It is possible it will destroy it modifications were made or not configured correctly.\nI am not responsible for any issues.".white}\n\n${"▲ READ ME ▲ READ ME ▲ READ ME ▲ READ ME ▲ READ ME ▲ READ ME ▲ READ ME ▲ READ ME ▲".yellow.bold.underline}\n${"To accept please type 'I accept'".white}\n> `, input => {
        readline.close();
        if (input.toLowerCase() == "i accept") {
            if (settings.guild) {
                console.log(`\nYay :)\nNow starting...`.green.bold)
                console.log(`Opening file...`.cyan.bold);
                fs.readFile(process.argv[2], "utf8", (err, data) => {
                    if (err) return console.error(`!! ERROR: ${err.message}\nQuitting process...`.red.bold);
                    console.log(`File opened! (${process.argv[2].split("/")[process.argv[2].split("/").length - 1]})`.cyan.bold);
                    let dbData = JSON.parse(data);
                    // Get all warnings
                    let warnings = [];
                    for (let warning in dbData.warnings) {
                        warnings.push(warning);
                    }
                    // Process warnings...
                    console.log(`${warnings.length.toString().bold} will be processed in 10 seconds!`.bgRed);
                    setTimeout(() => {
                        let i = 0;
                        function addWarning() {
                            setTimeout(() => {
                                // Add the warning.
                                let warning = dbData.warnings[warnings[i]];
                                db.addWarning(settings.guild, warning.user.replace(/[^\d]/g, ""), settings.points, warning.reason, warning.issuer)
                                .then(() => {
                                    console.log(`${(i + 1).toString().padStart(warnings.length.toString().length, " ")}/${warnings.length} | ${"Added warning".brightGreen} > ${"Warning ID:".bold} ${warnings[i]} ${"to".bold} ${warning.user.replace(/[^\d]/g, "")}`);
                                    if (i + 1 == warnings.length) {
                                        // Done message
                                        console.log(`　　     　 　 ∧_,,∧　　　\n    　♪　　   (・ω・)　　♪\n   ＿＿＿ ＿○＿＿つヾ＿＿\n /δ⊆・⊇ 。/†: :† /δ ⊆・⊇｡ /|\n|￣￣￣￣￣￣￣￣￣￣￣ | |\n|　　　　　　　　　　 　|`.cyan.bold)
                                        console.log(`          Done! :)`.brightGreen.bold);
                                    }
                                    i++;
                                    if (i < warnings.length) addWarning();
                                });
                            }, settings.delay)
                        }
                        addWarning();
                    }, 10000);
                });
            }
            else {
                console.log(`bruh bruh bruh bruh\nbruh bruh bruh bruh\nbruh bruh bruh bruh\nbruh bruh bruh bruh\n\nREAD THE MESSAGE ABOVE!!! UPDATE THE SETTINGS IN src/update.js`.red.bold);
                process.exit();
            }
        }
        else {
            console.log(`Invalid answer! Quitting process...`.red.bold);
            process.exit();
        }
    });
}, 3000);