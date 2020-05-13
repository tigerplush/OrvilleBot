const {userDb} = require('../Database/databases.js');

const UserInfoError = require('../Database/UserInfoError.js');

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
                    if(user.island)
                    {
                        return message.reply(`your island name is currently '${user.island}'`);
                    }
                    throw new UserInfoError("you have not set your island name yet");
                }
                else
                {
                    const islandName = args.join(' ');
                    message.client.emit('islandUpdate', {serverid: serverid, userid: userid, island: islandName});
                    if(user.island)
                    {
                        return message.reply(`I've updated your island name to '${islandName}'`);
                    }
                    throw new UserInfoError(`I've set your island name to '${islandName}'`);
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
    }
};