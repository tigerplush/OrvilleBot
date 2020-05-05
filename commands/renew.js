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
        const database = client.database;
        const serverid = message.guild.id;
        const userid = message.author.id;

        database.getOpenIsland(serverid, userid)
        .then(island =>
            {
                let closingMessage = "renewing your lease";
                database.getUser(serverid, userid)
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