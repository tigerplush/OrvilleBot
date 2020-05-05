const Discord = require('discord.js');
module.exports =
{
    name: "reset",
    usage: "(island/name/title)",
    description: "Deletes a property from the database. Deletes all properties from the database if no argument is given",
    example: [
        ["", "deletes all your entries from the database"],
        ["island", "deletes your island name"],
        ["name", "deletes your ingame name"],
        ["title", "deletes your ingame title"]
    ],
    execute(message, args)
    {
        const serverid = message.guild.id;
        const userid = message.author.id;
        const database = message.client.database;

        if(args.length < 1)
        {
            database.deleteUser(serverid, userid)
            .then(numberOfDeletes =>
                {
                    if(numberOfDeletes > 0)
                    {
                        message.reply("I deleted all your infos from the database");
                    }
                    else
                    {
                        message.reply("I couldn't find you in my database");
                    }
                })
            .catch(err => console.log(err));
        }
        else
        {
            prop = args[0];
            if(prop === "island" || prop === "name" || prop === "title")
            {
                database.deleteProperty(serverid, userid, prop)
                .then(numberOfUpdates =>
                    {
                        if(numberOfUpdates > 0)
                        {
                            message.reply("I deleted your " + prop + " from the database");
                        }
                        else
                        {
                            message.reply("I couldn't find your " + prop + " in my database");
                        }
                    })
                .catch(err => console.log(err));
            }
            else
            {
                message.reply("you can only delete your ingame `name`, your `island` name or your ingame `title`.");
            }
        }
    },
};