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
        const database = client.database;
        const serverid = message.guild.id;
        const userid = message.author.id;

        database.getOpenIsland(serverid, userid)
        .then(island =>
            {
                let closingMessage = "now closing your island";
                database.getUser(serverid, userid)
                .then(user =>
                    {
                        if(user.island)
                        {
                            closingMessage += " " + user.island;
                        }
                        return closingMessage;
                    })
                .catch(err => console.log(err))
                .then(closingMessage => message.reply(closingMessage));

                deleteIslandMessage(client, serverid, island.messageid);

                client.emit('closeIsland', {serverid: serverid, userid: userid});
            })
        .catch(err =>
            {
                message.reply("you currently have no open island");
                console.log(err + " for server " + serverid + " and user " + userid);
            });
    },
};

function deleteIslandMessage(client, serverid, messageid)
{
    const database = client.database;

    database.getAirport(serverid)
    .then(airport =>
        {
            client.channels.fetch(airport.channelid)
            .then(channel =>
                {
                    channel.messages.fetch(messageid)
                    .then(message =>
                        {
                            message.delete()
                            .catch(err => console.log(err));
                        })
                    .catch(() =>
                        {
                            console.log("Could not find arrival message, must have already been deleted");
                        });
                })
            .catch(() => console.log("Could not find airport channel, must have been deleted"));
        })
    .catch(err => console.log(err));
}