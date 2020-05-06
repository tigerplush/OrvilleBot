const {openIslandsDb, userDb} = require('../Database/databases.js');

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

        openIslandsDb.get(serverid, userid)
        .then(islands =>
            {
                if(islands && islands.length > 0)
                {
                    island = islands[0];
                    let closingMessage = "now closing your island";
                    userDb.get(serverid, userid)
                    .then(user =>
                        {
                            if(user.island)
                            {
                                closingMessage += " " + user.island;
                            }
                            return closingMessage;
                        })
                    .catch(err =>
                        {
                            console.log(err);
                            return closingMessage;
                        })
                    .then(closingMessage => message.reply(closingMessage));

                    client.emit('closeIsland', {serverid: serverid, userid: userid, messageid: island.messageid, warningmessageid: island.warningmessageid});
                }
                else
                {
                    message.reply("you currently have no open island");
                }
            })
        .catch(err =>
            {
                console.log(err + " for server " + serverid + " and user " + userid);
            });
    },
};