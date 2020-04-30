const Discord = require('discord.js');

module.exports =
{
    name: "open",
    usage: "dodo-code (comment)",
    description: "Opens your island. Dodo code is mandatory, comments (e.g. for turnip prices or diy recipes) is optional",
    example:
        [
            ["ASDFG", "opens an island with the dodo code 'ASDFG'"],
            ["ASDFG turnip prices 603!!!", "opens an island with the dodo code 'ASDFG' and the comment 'turnip prices 603!!!'"]
        ],
    execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code!")
            return;
        }

        let dodoCode = args.shift();
        if(! /^([a-zA-Z0-9_-]){5}$/.test(dodoCode))
        {
            message.reply("Your dodo code is invalid!");
            return;
        }
        dodoCode = dodoCode.toUpperCase();

        const bot = message.client;

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
            let newIsland = {};

            const serverCollection = message.client.userInfo;
            if(serverCollection.has(guildid))
            {
                const userCollection = serverCollection.get(guildid);
                if(userCollection.has(userid))
                {
                    newIsland = userCollection.get(userid);
                }
            }

            let title = args.join(' ');

            let airport = bot.airports.get(guildid);
            let currentAirport = bot.channels.cache.get(airport);
            if(currentAirport)
            {
                newIsland.arrivalMessage = {};
                newIsland.baseUrl = "";
                newIsland.serverid = guildid;
                newIsland.userid = message.author.id;
                newIsland.title = title;
                newIsland.dodocode = dodoCode;
                islandCollection.set(userid, newIsland);
                bot.emit('openIsland', newIsland);
            }
        }
    },
};