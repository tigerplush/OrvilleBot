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
        let openingMessage;

        let newAirport = {};
        newAirport.serverid = serverid;
        newAirport.channelid = channelid;
        airportsDb.getAirport(serverid)
        .then(airport =>
            {
                let openMessage = "Airport successfully opened";
                if(airport)
                {
                    //there is an airport, update
                    openMessage = "Airport successfully updated";
                }
                openMessage += "\nReact within 1 minute with an emoji to set a reaction for queuing up users";
                //create new airport
                return message.channel.send(openMessage);
            })
        .catch(err => console.log(err))
        .then(airportMessage =>
            {
                openingMessage = airportMessage;
                const filter = mes => mes;
                airportMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(messageReactions =>
                    {
                        newAirport.emoji = messageReactions.first().emoji.name;
                    })
                .catch(err => console.log(err))
                .finally(() =>
                {
                    openingMessage.edit("Airport is currently open!");
                    message.client.emit('updateAirports', newAirport);
                });
            })
        .catch(err => console.log(err));
    },
};