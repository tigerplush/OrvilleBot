const {airportsDb, openIslandsDb, userDb} = require('../Database/databases.js');

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

        openIslandsDb.getIsland({serverid: serverid, userid: userid})
        .then(island =>
            {
                let closingMessage = "renewing your lease";
                userDb.getUser(serverid, userid)
                .then(user =>
                    {
                        if(user.island)
                        {
                            closingMessage += " for " + user.island;
                        }
                        return closingMessage;
                    })
                .catch(err =>
                    {
                        console.log(err);
                        return closingMessage;
                    })
                .then(closingMessage =>
                    {
                        message.reply(closingMessage);
                        client.emit('renewLease', island);
                    });
            })
        .catch(err =>
            {
                message.reply("you currently have no open island");
                console.log(err + " for server " + serverid + " and user " + userid);
            });
    },
};