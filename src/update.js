// Warnable 2.0.0 - Updater (Convert Warnable 1.0.0 warnings for 2.0.0)

var settings = {
    guild: "669869390287863850", // The Discord Server ID to add the warnings to.
    points: 1, // Warning points for each warning added.
    delay: 10, // Delay (in milliseconds) between adding warnings. This is for if you don't want to abuse your db.
}

const chalk = require("chalk");
const fs = require("fs");
const readline = require("readline").createInterface({ input: process.stdin, output: process.stdout });
const Database = require("./db");
const db = new Database();

let startupLog = "Warnable Updater - Convert Warnable 1.0.0 for 2.0.0";
console.log(chalk.cyan.bold(`　　　　　　 ∧＿∧　\n　　　　　（｡･ω･｡)つ━☆・*。\n　　　　　⊂　　 ノ 　　　・゜+.\n　　　　　　しーＪ　　　°。+ *´¨)\n　　　　　　　　　　　　　　.· ´¸.·*´¨) ¸.·*¨)\n　　　　　　　　　　　　　　　(¸.·´ (¸.·'* ☆\n　　　Warnable - www.github.com/zacimac/warnable`));
console.log(chalk.magenta.bold(`╔═${"═".repeat(startupLog.length)}═╗`));
console.log(chalk.magenta.bold(`║ ${startupLog} ║`));
console.log(chalk.magenta.bold(`╚═${"═".repeat(startupLog.length)}═╝\n `));

setTimeout(() => {
    readline.question(`
${chalk.yellowBright.bold("▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼ READ ME ▼")}

${chalk.white("This process will merge the Warnable 1.0.0 database with your Warnable 2.0.0 database (db.js).")}
${chalk.white("Because Warnable 1.0.0 didn't support mutliple servers, this updater can only update warnings to one server.")}
${chalk.white("Warning points didn't exist in Warnable 1.0.0, so it will apply the same warning points set in the settings to every warning.")}
${chalk.white("Warning times are will be inaccurate too, as they are handled by the DB module and not the updater.")}

${chalk.whiteBright.bold.bgRed("!!! MAKE SURE YOU SET SETTINGS FIRST (in update.js) OTHERWISE IT WILL BREAK !!!")}
${chalk.whiteBright.bold.bgRed("IF YOU HAVE A DATABASE ALREADY, PLEASE MAKE A BACKUP OF YOUR DATABASE!")}
${chalk.whiteBright.bold.bgRed("THIS OPERATION CAN NOT BE UNDONE!")}

${chalk.white("It is possible it will destroy it modifications were made or not configured correctly.")}
${chalk.white("You have been warned! To accept, please enter 'i accept'")}

${chalk.yellowBright.bold("▲ READ ME ▲ READ ME ▲ READ ▲ READ ME ▲ READ ME ▲ READ ▲ READ ME ▲ READ ME ▲ READ ▲")}
> `, input => {
        readline.close();
        if (input.toLowerCase() == "i accept") {
            if (settings.guild) {
                console.log(chalk.green("\nYay :)\nNow starting..."))
                console.log(chalk.cyan.bold("Opening file..."));
                fs.readFile(process.argv[2], "utf8", (err, data) => {
                    if (err) return console.error(chalk.red.bold("!! ERROR: ${err.message}\nQuitting process..."));
                    console.log(chalk.cyan.bold(`File opened! (${process.argv[2].split("/")[process.argv[2].split("/").length - 1]})`));
                    let dbData = JSON.parse(data);
                    // Get all warnings
                    let warnings = [];
                    for (let warning in dbData.warnings) {
                        warnings.push(warning);
                    }
                    // Process warnings...
                    console.log(chalk.bgRedBright(`${chalk.bold(warnings.length.toString())} will be processed in 10 seconds!`));
                    setTimeout(() => {
                        let i = 0;
                        function addWarning() {
                            setTimeout(() => {
                                // Add the warning.
                                let warning = dbData.warnings[warnings[i]];
                                db.addWarning(settings.guild, warning.user.replace(/[^\d]/g, ""), settings.points, warning.reason, warning.issuer)
                                .then(() => {
                                    console.log(`${(i + 1).toString().padStart(warnings.length.toString().length, " ")}/${warnings.length} | ${chalk.greenBright("Added")} > ${chalk.bold("Warning ID:")} ${warnings[i]} ${chalk.bold("to")} ${warning.user.replace(/[^\d]/g, "")}`);
                                    if (i + 1 == warnings.length) {
                                        // Done message
                                        console.log(chalk.cyan.bold("　　     　 　 ∧_,,∧　　　\n    　♪　　   (・ω・)　　♪\n   ＿＿＿ ＿○＿＿つヾ＿＿\n /δ⊆・⊇ 。/†: :† /δ ⊆・⊇｡ /|\n|￣￣￣￣￣￣￣￣￣￣￣ | |\n|　　　　　　　　　　 　|"))
                                        console.log(chalk.greenBright.bold("          Done! :)"));
                                    }
                                    i++;
                                    if (i < warnings.length) addWarning();
                                });
                            }, settings.delay)
                        }
                        addWarning();
                    }, 1000);
                });
            }
            else {
                console.log(chalk.whiteBright.bgRedBright("bruh bruh bruh bruh\nbruh bruh bruh bruh\nbruh bruh bruh bruh\nbruh bruh bruh bruh\n\nREAD THE MESSAGE ABOVE!!! UPDATE THE SETTINGS IN src/update.js"));
                process.exit();
            }
        }
        else {
            console.log(chalk.red.bold("Invalid answer! Quitting process..."));
            process.exit();
        }
    });
}, 3000);