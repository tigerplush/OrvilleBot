const {airportsDb} = require('../Database/databases.js');

class AirportError extends Error
{
    constructor(message)
    {
        super(message);
    }
}

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

        airportsDb.get({serverid: serverid})
        .then(airports =>
            {
                let verb = "opened";
                if(airports && airports > 0)
                {
                    const airport = airports[0];
                    verb = "moved";
                    if(airport.channelid === message.channel.id)
                    {
                        verb = "updated";
                    }
                }

                let openMessage = `Airport successfully ${verb}\nReact within 1 minute with an emoji to set a reaction for queuing up users`;
                return message.channel.send(openMessage);
            })
        .then(airportMessage =>
            {
                openingMessage = airportMessage;
                const filter = mes => mes;
                return airportMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] });
            })
        .then(messageReactions =>
            {
                newAirport.emoji = messageReactions.first().emoji.name;
            })
        .then(() =>
            {
                openingMessage.edit("Airport is currently open!");
                message.client.emit('updateAirports', newAirport);
            })
        .catch(err => console.log(err));
    },
};