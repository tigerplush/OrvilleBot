module.exports =
{
    name: "add-airport",
    usage: "server-id channel-id",
    description: "Adds a channel of a server as airport",
    execute(message, args)
    {
        if(args.length != 2)
        {
            message.reply("please specify a server and a channel id!");
            return;
        }

        const serverid = args[0];
        const channelid = args[1];
        const airports = message.client.airports;
        if(airports.has(serverid))
        {
            //there is an airport, so update
            airports.get(serverid).channelid = channelid;
        }
        else
        {
            //it is a new update, so create
            airports.set(serverid, channelid);
        }
        message.client.emit('updateAirports', {serverid: serverid, channelid: channelid});
    },
};