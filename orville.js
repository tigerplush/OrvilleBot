const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const Datastore = require('nedb');
const database = require('./database.js');
const graphic = require('./graphic.js');
const {prefix, url} = require('./config.json');
const content = require('./content.js');

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

bot.on('openIsland', island => {
    if(url && url.length != 0)
    {
        graphic.requestImage(bot, island);
    }
    else
    {
        bot.emit('fetchedUrl', island);
    }
});

bot.on('closeIsland', islandData => {
    database.closeIsland(islandData)
    graphic.removeImage({serverid: islandData.guildid, userid: islandData.userid});
});

bot.on('userUpdate', userData => {
    database.updateUserData(userData)
});

bot.on('requestSent', (island) => {
    graphic.getImageBaseUrl(bot, island);
});

bot.on('fetchedUrl', (island) => {
    const arrivalMessageContent = content.create(island);

    let attachment;
    if(island.baseUrl)
    {
        attachment = new Discord.MessageAttachment(Buffer.from(island.baseUrl));
    }
    bot.channels.cache.get(bot.airports.get(island.serverid)).send(arrivalMessageContent, attachment)
    .then(graphMessage => 
        {
            island.arrivalMessage = graphMessage;
        })
    .catch(err => console.log(err));
    
    //database.openIsland(islandData);
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

        try
        {
            bot.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
    
});

bot.login(auth.token)
.catch(err => console.log(err));
