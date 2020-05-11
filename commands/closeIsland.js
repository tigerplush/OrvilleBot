const {openIslandsDb, userDb} = require('../Database/databases.js');

class ClosingError extends Error
{
    constructor(message)
    {
        super(message);
    }
}

module.exports =
{
    name: "close",
    usage: "",
    description: "Closes your currently open island",
    example:
        [
            ["", "closes your currently open island"]
        ],
    execute(message, args)
    {
        const client = message.client;
        const serverid = message.guild.id;
        const userid = message.author.id;


        let userInfo;
        let closingMessage;
        let island;

        userDb.get(serverid, userid)
        .then(user =>
            {
                userInfo = user;
                return openIslandsDb.get(serverid, userid);
            })
        .then(islands =>
            {
                if(islands && islands.length > 0)
                {
                    closingMessage = "now closing your island";
                    island = islands[0];
                    if(userInfo.island)
                    {
                        closingMessage += " " + userInfo.island;
                    }
                    client.emit('closeIsland', {serverid: serverid, userid: userid, messageid: island.messageid, warningmessageid: island.warningmessageid});
                    return message.reply(closingMessage);
                }
                else
                {
                    throw new ClosingError("you currently have no open island");
                }
            })
        .catch(err =>
            {
                if(err instanceof ClosingError)
                {
                    message.reply(err.message);
                }
                console.log(err);
            });
    },
};