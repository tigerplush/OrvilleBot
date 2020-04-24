const Discord = require('discord.js');

module.exports =
{
    name: "open",
    usage: "<dodo code> (Ingame name) (Island name)",
    description: "Opens your island. Dodo code is mandatory, ingame name and island name can be omitted",
    async execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code!")
            return;
        }

        const dodo_code = args.shift();
        if(! /^([a-zA-Z0-9_-]){5}$/.test(dodo_code))
        {
            message.reply("Your dodo code is invalid!");
            return;
        }

        const bot = message.client;

        //Create an island
        let islandName = "";

        for(let i = 2; i < args.length; i++)
        {
            islandName += args[i] + " ";
        }

        islandName = islandName.trim();
        
        let newIsland = {
            "owner": message.author,
            "dodo_code": args[0].toUpperCase(),
            "user_name": args[1],
            "island_name": islandName
        };

        const guildid = message.guild.id;
        let islandCollection;

        if(bot.openIslands.has(guildid))
        {
            islandCollection = bot.openIslands.get(guildid);
        }
        else
        {
            islandCollection = new Discord.Collection();
            bot.openIslands.set(guildid, islandCollection);
        }

        //Check if user has an island open
        let userid = message.author.id;
        if(islandCollection.has(userid))
        {            
            message.reply("you already have an island open");
        }
        else
        {
            //open new island
            let arrivalMessageContent = "<@" + userid + ">";
            if(newIsland.user_name)
            {
                arrivalMessageContent += " (_" + newIsland.user_name + "_) ";
            }
            if(newIsland.island_name)
            arrivalMessageContent += ": **" + dodo_code.toUpperCase() + "**";
            {
                arrivalMessageContent += "from " + newIsland.island_name;
            }

            let airport = bot.airports.get(guildid);
            let currentAirport = bot.channels.cache.get(airport);
            if(currentAirport)
            {                
                let arrivalMessage = await currentAirport.send(arrivalMessageContent);
                newIsland.arrival_message = arrivalMessage;
                islandCollection.set(userid, newIsland);
                bot.emit('openIsland', {guildid: guildid, userid: userid});
            }
        }
    },
};