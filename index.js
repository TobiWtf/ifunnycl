#!/usr/bin/env node

const readline = require("readline");
require("colors");
const fs = require("fs");
const ifunny = new (require("./ifunny"))({});
var path = require('path');

var configPath = path.join(__dirname, 'config.json');

const rl = readline.createInterface(
    {
        input: process.stdin,
        output: process.stdout,
    },
);

const writeConfig = data => {
    fs.writeFileSync(configPath, JSON.stringify(data))
};

const readConfig = async => {
    return JSON.parse(fs.readFileSync(configPath));
};

var args = process.argv.slice(2);

let command = args[0];

if (!command) {
    console.log(`use "${'ifunnycl --help'.yellow}" for help`);
    process.exit(0);
};

let commands = ["--help", "--login", "--bearer", "--uid", "--basic"];

if (command == "--help") {
    console.log(
        `Commands {\n\t\t${commands.join("\n\t\t")}\n\t }`
    );
    rl.close();
};

if (command == "--login") {
    rl.question(
        "email: ",
        async email => {
            rl.question(
                "password: ",
                async password => {
                    ifunny.login(
                        email, 
                        password,
                        async opts => {
                            writeConfig(opts);
                            rl.close();
                        }
                    )
                    
                },
            );
        },
    );
};

if (command == "--bearer") {
    (
        async() => {
            let conf = await readConfig();
            if (!conf.bearer) {
                console.log("Please login before running this...");
                rl.close()
                process.exit(0);
            } else {
                console.log(conf.bearer);
                rl.close();
                process.exit(0)
            }
        }
    )(); 
}

if (command == "--basic") {
    (
        async() => {
            let conf = await readConfig();
            if (!conf.basic) {
                console.log("Please login before running this...");
                rl.close()
                process.exit(0);
            } else {
                console.log(conf.basic);
                rl.close();
                process.exit(0)
            }
        }
    )(); 
}

if (command == "--uid") {
    (
        async() => {
            let conf = await readConfig();
            if (!conf.uid) {
                console.log("Please login before running this...");
                rl.close()
                process.exit(0);
            } else {
                console.log(conf.uid);
                rl.close();
                process.exit(0)
            }
        }
    )(); 
}

if (!commands.includes(command)) {
    console.log("Please run 'ifunnycl --help'")
    rl.close()
    process.exit(0)
};