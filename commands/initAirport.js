module.exports =
{
    name: "init-airport",
    usage: "",
    hidden: true,
    description: "Initialises this channel as airport",
    execute(message, args)
    {
        if(!message.member.permissions.has("ADMINISTRATOR "))
        {
            message.reply("You are not authorized to do this!")
            return;
        }
        const serverid = message.guild.id;
        const channelid = message.channel.id;
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
        message.channel.send("Airport successfully opened");
        message.client.emit('updateAirports', {serverid: serverid, channelid: channelid});
    },
};