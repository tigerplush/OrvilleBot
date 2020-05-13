const {userDb} = require('../Database/databases.js');
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

        if(args.length < 1)
        {
            userDb.removeUser(serverid, userid)
            .then(numberOfDeletes =>
                {
                    let messageContent = "I couldn't find you in my database";
                    if(numberOfDeletes > 0)
                    {
                        messageContent = "I deleted all your infos from the database";
                    }
                    return message.reply(messageContent);
                })
            .catch(err => console.log(err));
        }
        else
        {
            prop = args[0];
            if(prop === "island" || prop === "name" || prop === "title")
            {
                userDb.removeProperty(serverid, userid, prop)
                .then(propertyValue =>
                    {
                        let messageContent = "I couldn't find your " + prop + " in my database";
                        if(propertyValue)
                        {
                            messageContent = "I deleted your " + prop + " from the database";
                        }
                        return message.reply(messageContent);
                    })
                .catch(err => console.log(err));
            }
            else
            {
                message.reply("you can only delete your ingame `name`, your `island` name or your ingame `title`")
                .catch(err => console.log(err));
            }
        }
    },
};