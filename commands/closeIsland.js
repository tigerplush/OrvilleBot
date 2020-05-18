const {openIslandsDb, userDb, openQueuesDb} = require('../Database/databases.js');

class ClosingError extends Error
{
    constructor(message)
    {
        super(message);
    }
}

String.prototype.capitalize = function()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
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
        let closingMessage = "now closing your ";
        let toClose = [];
        let island;
        let queue;

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
                    toClose.push("island");
                    island = islands[0];
                }
                return openQueuesDb.get({serverid: serverid, userid: userid});
            })
        .then(queues =>
            {
                if(queues && queues.length > 0)
                {
                    toClose.push("queue");
                    queue = queues[0];
                }
            })
        .then(() =>
            {
                if(toClose.length == 0)
                {
                    let nothingToClose = "you currently have no open islands or queues";
                    throw new ClosingError(nothingToClose);
                }
                else
                {
                    closingMessage += toClose.map(str => str);
                    if(userInfo.island)
                    {
                        closingMessage += " " + userInfo.island;
                    }
                    client.emit('close' + toClose[0].capitalize(), island, queue);
                    message.reply(closingMessage);
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