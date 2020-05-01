const Discord = require('discord.js');
module.exports =
{
    name: "title",
    usage: "your-title",
    description: "Sets or updates your ingame title. Without a title I will tell you your current title",
    example: [
        ["", "returns your current title"],
        ["Radical", "sets your ingame title to 'Radical"],
        ["So-called intellectual", "sets your ingame title to 'So-called intellectual'"]
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
                if(user.title)
                {
                    message.reply(" your ingame title is currently '" + user.title + "'");
                }
                else
                {
                    throw new Error("404 - Title not found");
                }
            })
            .catch(err => {
                message.reply(" you have not set your ingame title yet");
                console.log(err);
            });
        }
        else
        {
            const title = args.join(' ');
            database.getUser(serverid, userid)
            .then(user =>
                {
                    if(user.island)
                    {
                        message.reply(" I've updated your ingame title to '" + title + "'");
                    }
                    else
                    {
                        throw new Error("404 - Title not found");
                    }
                })
            .catch(err =>
                {
                    message.reply(" I've set your ingame title to '" + title + "'");
                    console.log(err);
                });

            message.client.emit('islandUpdate', {serverid: serverid, userid: userid, title: title});
        }
    }
};