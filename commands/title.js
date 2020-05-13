const {userDb} = require('../Database/databases.js');

const UserInfoError = require('../Database/UserInfoError.js');

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
                    if(user.title)
                    {
                        return message.reply(`your ingame title is currently '${user.title}'`);
                    }
                    throw new UserInfoError("you have not set your ingame title yet");
                }
                else
                {
                    const title = args.join(' ');
                    message.client.emit('islandUpdate', {serverid: serverid, userid: userid, title: title});

                    if(user.title)
                    {
                        return message.reply(`I've updated your ingame title to '${title}'`);
                    }
                    throw new UserInfoError(`I've set your ingame title to '${title}'`);
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