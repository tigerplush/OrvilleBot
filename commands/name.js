const Discord = require('discord.js');
module.exports =
{
    name: "name",
    usage: "your-name",
    description: "Sets or updates your ingame name. Without a name I will tell you your current name",
    example: [
        ["", "returns your current name"],
        ["Cheddar", "sets your name to 'Cheddar'"],
        ["Gizmo the gremlin", "sets your name to 'Gizmo the gremlin'"]
    ],
    execute(message, args)
    {
        const serverid = message.guild.id;
        const userid = message.author.id;
        const database = message.client.database;

        if(args.length < 1)
        {
            database.getUser(serverid, userid)
            .then(user =>
                {
                    if(user.name)
                    {
                        message.reply(" your ingame name is currently '" + user.name + "'");
                    }
                    else
                    {
                        throw new Error("404 - Name not found");
                    }
                })
            .catch(err =>
                {
                    message.reply(" you have not set your ingame name yet");
                    console.log(err);
                });
        }
        else
        {
            const name = args.join(' ');
            database.getUser(serverid, userid)
            .then(user =>
                {
                    if(user.name)
                    {
                        message.reply(" I've updated your ingame name to '" + name + "'");
                    }
                    else
                    {
                        throw new Error("404 - Name not found");
                    }
                })
            .catch(err =>
                {
                    message.reply(" I've set your ingame name to '" + name + "'");
                    console.log(err);
                });
            message.client.emit('userUpdate', {serverid: serverid, userid: userid, name: name});
        }
    },
};