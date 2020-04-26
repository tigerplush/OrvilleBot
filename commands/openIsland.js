const Discord = require('discord.js');

module.exports =
{
    name: "open",
    usage: "dodo-code (comment)",
    description: "Opens your island. Dodo code is mandatory, comments (e.g. for turnip prices or diy recipes) is optional",
    async execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code!")
            return;
        }

        let dodo_code = args.shift();
        if(! /^([a-zA-Z0-9_-]){5}$/.test(dodo_code))
        {
            message.reply("Your dodo code is invalid!");
            return;
        }
        dodo_code = dodo_code.toUpperCase();

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
            let arrivalMessageContent = "<@" + userid + ">";
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
            
            if(newIsland.name)
            {
                arrivalMessageContent += " (_" + newIsland.name + "_)";
            }
            if(newIsland.island)
            {
                arrivalMessageContent += " from " + newIsland.island;
            }
            arrivalMessageContent += ": **" + dodo_code + "**";

            let comment = args.join(' ');
            if(comment)
            {
                arrivalMessageContent += " (" + comment + ")";
            }

            let airport = bot.airports.get(guildid);
            let currentAirport = bot.channels.cache.get(airport);
            if(currentAirport)
            {                
                let arrivalMessage = await currentAirport.send(arrivalMessageContent);
                newIsland.serverid = guildid;
                newIsland.userid = message.author.id;
                newIsland.title = comment;
                newIsland.arrival_message = arrivalMessage;
                newIsland.dodocode = dodo_code;
                islandCollection.set(userid, newIsland);
                bot.emit('openIsland', {guildid: guildid, userid: userid, arrivalMessage: arrivalMessage});
            }
        }
    },
};