const {openIslandsDb, userDb} = require('../Database/databases.js');

const OpenIslandError = require('../Database/OpenIslandError.js');

module.exports =
{
    name: "renew",
    usage: "",
    description: "Renews the lease on your island for another 3h",
    example:
        [
            ["", "renews the lease on your island for another 3h"]
        ],
    execute(message, args)
    {
        const client = message.client;
        const serverid = message.guild.id;
        const userid = message.author.id;

        let closingMessage = "renewing your lease";
        let islandToRenew;

        openIslandsDb.getIsland({serverid: serverid, userid: userid})
        .then(island =>
            {
                islandToRenew = island;
                return userDb.getUser(serverid, userid)
                .catch(err =>
                    {
                        return {};
                    });
            })
        .then(user =>
            {
                if(user.island)
                {
                    closingMessage += " for " + user.island;
                }
            })
        .then(() =>
            {
                client.emit('renewLease', islandToRenew);
                return message.reply(closingMessage);
            })
        .catch(err =>
            {
                if(err instanceof OpenIslandError)
                {
                    message.reply("you currently have no open island")
                }
                console.log(err + " for server " + serverid + " and user " + userid);
            });
    },
};