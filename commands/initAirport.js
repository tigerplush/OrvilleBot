const {airportsDb} = require('../Database/databases.js');

module.exports =
{
    name: "init-airport",
    usage: "",
    hidden: true,
    description: "Initialises this channel as airport",
    execute(message, args)
    {
        if(!message.member.permissions.has("ADMINISTRATOR" || "MANAGE_GUILD" || "MANAGE_CHANNELS"))
        {
            message.reply("You are not authorized to do this!")
            return;
        }

        const serverid = message.guild.id;
        const channelid = message.channel.id;

        airportsDb.getAirport(serverid)
        .then(airport =>
            {
                if(airport)
                {
                    //there is an airport, update
                    message.channel.send("Airport successfully moved");
                }
                else
                {
                    //create new airport
                    message.channel.send("Airport successfully opened");
                }
                message.client.emit('updateAirports', {serverid: serverid, channelid: channelid});
            })
        .catch(err => console.log(err));
    },
};