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

bot.database = database;

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);

	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	bot.commands.set(command.name, command);
}

bot.on('updateAirports', airport => {
    bot.database.updateAirport(airport)
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

bot.on('closeIsland', island => {
    bot.database.closeIsland(island);
    graphic.removeImage({serverid: island.serverid, userid: island.userid});
});

bot.on('userUpdate', userData => {
    bot.database.updateUserData(userData)
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
    bot.database.getAirport(island.serverid)
    .then(airport => {
        bot.channels.fetch(airport.channelid)
        .then(channel =>
            {
                channel.send(arrivalMessageContent, attachment)
                .then(graphMessage =>
                    {
                        island.arrivalMessageId = graphMessage.id;
                        database.openIsland(island);
                    })
                .catch(err => console.log(err));
            })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

bot.on('ready', () => {
    bot.database.loadDatabases();
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
