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

let commands = {};

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

//! Opens a new Island
//! args[0] is the original message
//! args[1] is the open command
//! args[2] is the dodo code
//! args[3] is the user
//! args[4] and later is Island name
async function openIsland(args)
{
    message = args[0];
    if(args.length < 3)
    {
        message.reply("Please provide a dodo code!")
        return;
    }

    //Create an island
    let islandName = message.content.split(/[ !]/).slice(4).join(" ");
    let newIsland = {
        "owner": message.author,
        "dodo_code": args[2],
        "user_name": args[3],
        "island_name": islandName
    };

    //Check if island is open
    if( bot.openIslands.find(island => island.owner == newIsland.owner) )
    {
        //Yes island is already open
        message.channel.send("You already have an island open");
    }
    else
    {
        //No, island is not open yet
        let arrivalMessageContent = "<@" + message.author.id + "> - ";
        if(newIsland.user_name)
        {
            arrivalMessageContent += "_" + newIsland.user_name + "_ ";
        }
        if(newIsland.island_name)
        {
            arrivalMessageContent += "from " + newIsland.island_name;
        }
        arrivalMessageContent += ": **" + newIsland.dodo_code + "**";

        let currentAirport = bot.airports.find(airport => airport.guild == message.guild);
        let arrivalMessage = await currentAirport.send(arrivalMessageContent);
        newIsland.arrival_message = arrivalMessage;
        bot.openIslands.push(newIsland);
    }
}

function closeIsland(args)
{
    message = args[0];
    let island = openIslands.find(island => island.owner == message.author)
    if(island)
    {
        closingMessage = "Now closing your island";
        if(island.island_name)
        {
            closingMessage += " " + island.island_name;
        }
        message.reply("Now closing your island");

        
        let islandIndex = openIslands.indexOf(island);
        openIslands.splice(islandIndex, 1);
        island.arrival_message.delete();
    }
    else
    {
        message.reply("You currently have no open island");
    }
}

function info(args)
{
    message = args[0];
    let infoString = "";
    infoString += package.name + " v" + package.version + "\n";
    infoString += package.description + "\n";
    infoString += "by " + package.author;
    message.channel.send(infoString);
}

commands["open"] = openIsland;
commands["close"] = closeIsland;
commands["info"] = info;

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
        // args[0] = message;
        // try
        // {
        //     commands[args[1]](args);
        // }
        // catch (err)
        // {
        //     message.reply("Sorry, I didn't understand that");
        //     console.log(err);
        // }

    }
    
});

bot.login(auth.token);
