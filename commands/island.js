const Discord = require('discord.js');
module.exports =
{
    name: "island",
    usage: "your-island-name",
    description: "Sets or updates your island name. Without an island name I will tell you your current island name",
    example: [
        ["", "returns your current island name"],
        ["Winterland", "sets your island name to 'Winterland'"],
        ["Isla Corgi", "sets your name to 'Isla Corgi"]
    ],
    execute(message, args)
    {
        const database = message.client.database;
        const serverid = message.guild.id;
        const userid = message.author.id;

        if(args.length < 1)
        {
            database.getUser(serverid, userid)
            .then(user => {
                if(user.island)
                {
                    message.reply(" your island name is currently '" + user.island + "'");
                }
                else
                {
                    throw new Error("404 - Island not found");
                }
            })
            .catch(err => {
                message.reply(" you have not set your island name yet");
                console.log(err);
            });
        }
        else
        {
            const islandName = args.join(' ');
            database.getUser(serverid, userid)
            .then(user =>
                {
                    if(user.island)
                    {
                        message.reply(" I've updated your island name to '" + islandName + "'");
                    }
                    else
                    {
                        throw new Error("404 - Island not found");
                    }
                })
            .catch(err =>
                {
                    message.reply(" I've set your island name to '" + islandName + "'");
                    console.log(err);
                });

            message.client.emit('userUpdate', {serverid: serverid, userid: userid, island: islandName});
        }
    }
};