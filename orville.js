const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const package = require('./package.json');
const Datastore = require('nedb');
const database = require('./database.js');
const {prefix, airportsdb, openislandsdb, userinfodb} = require('./config.json');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	bot.commands.set(command.name, command);
}

bot.airports = new Discord.Collection();
bot.openIslands = new Discord.Collection();
bot.userInfo = new Discord.Collection();

bot.on('updateAirports', airport => {
    database.updateAirport(airport)
});

bot.on('openIsland', islandData => {
    database.openIsland(islandData)
});

bot.on('closeIsland', islandData => {
    database.closeIsland(islandData)
});

bot.on('userUpdate', userData => {
    database.updateUserData(userData)
});

bot.on('ready', () => {
    database.loadDatabases(bot);
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
