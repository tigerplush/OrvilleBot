const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const package = require('./package.json');
const Datastore = require('nedb');
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

bot.openIslands = [];
bot.airports = new Discord.Collection();


const airports = new Datastore(airportsdb);

function loadData()
{
    airports.loadDatabase();
    airports.find({}, function(err, docs)
    {
        docs.forEach(airport => {
            bot.airports.set(airport.serverid, airport.channelid);
        });
    });


bot.on('updateAirports', airport =>
{
    airports.find({serverid: airport.serverid}, function(err, docs)
    {
        if(docs && docs.length > 0)
        {
            airports.update(
                {serverid: airport.serverid},
                {$set: {channelid: airport.channelid}},
                {},
                function (){});
        }
        else
        {            
            airports.insert(airport);
        }
    })
});

bot.on('ready', () => {
    loadData()
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
