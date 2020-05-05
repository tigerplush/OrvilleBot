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
                .catch(err =>
                    {
                        console.log(err);
                        return closingMessage;
                    })
                .then(closingMessage => message.reply(closingMessage));

                client.emit('closeIsland', {serverid: serverid, userid: userid, messageid: island.messageid});
            })
        .catch(err =>
            {
                message.reply("you currently have no open island");
                console.log(err + " for server " + serverid + " and user " + userid);
            });
    },
};