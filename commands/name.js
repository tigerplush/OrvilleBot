const {userDb} = require('../Database/databases.js');

const UserInfoError = require('../Database/UserInfoError.js');

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

        userDb.getUser(serverid, userid)
        .catch(err =>
            {
                if(err instanceof UserInfoError)
                {
                    return {};
                }
                throw new Error(err);
            })
        .then(user =>
            {
                if(args.length < 1)
                {
                    if(user.name)
                    {
                        return message.reply(`your ingame name is currently '${user.name}'`);
                    }
                    throw new UserInfoError("you have not set your ingame name yet");
                }
                else
                {
                    const name = args.join(' ');
                    message.client.emit('islandUpdate', {serverid: serverid, userid: userid, name: name});
                    if(user.name)
                    {
                        return message.reply(`I've updated your ingame name to '${name}'`);
                    }
                    throw new UserInfoError(`I've set your ingame name to '${name}'`);
                }
            })
        .catch(err =>
            {
                if(err instanceof UserInfoError)
                {
                    message.reply(err.message);
                }
                else
                {
                    console.log(err);
                }
            });
    },
};