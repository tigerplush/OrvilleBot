const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const package = require('./package.json');
const {prefix, flightScheduleName} = require('./config.json');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	bot.commands.set(command.name, command);
}

bot.airports = [];
bot.openIslands = [];

function createAirport()
{
    //iterates over every guild
    bot.guilds.cache.forEach(element => {

        let terminal = element.channels.cache.find(chan => chan.name === "terminal");
        if(!terminal)
        {
            let key = element.channels.cache.find(par => par.rawPosition == 0).id;
            
            element.channels.create("terminal", {
                type: "text",
                topic: "A place to open and close your islands",
                nsfw: "false",
                parent: key
            });
        }

        let airport = element.channels.cache.find(chan => chan.name === flightScheduleName);
        if(!airport)
        {
            let key = element.channels.cache.find(par => par.rawPosition == 0).id;
            
            element.channels.create(flightScheduleName, {
                type: "text",
                topic: "Current open islands",
                nsfw: "false",
                parent: key
            });
        }
        else
        {
            bot.airports.push(airport);
        }
    });
}

bot.on("ready", () => {
    createAirport()
});

bot.on('channelCreate', newChannel => {
    if(newChannel.name === flightScheduleName)
    {
        newChannel.send("Airport successfully opened\nType '!help' for some help");
        airports.push(newChannel);
    }
});

bot.on('message', message => {
    if(message.content.startsWith(prefix) && !message.author.bot)
    {
        const args = message.content.slice(prefix.length).split(/ +/);
	    const command = args.shift().toLowerCase();

        if (!bot.commands.has(command))
        {
            return;
        }

        try {
            bot.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
    
});

bot.login(auth.token);
