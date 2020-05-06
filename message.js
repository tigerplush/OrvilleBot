const moment = require('moment');
const {airportsDb, openIslandsDb} = require('./Database/databases.js');
const {closingTime} = require('./config.json');
module.exports =
{
    deleteIslandMessage(client, island)
    {
        airportsDb.getAirport(island.serverid)
        .then(airport =>
            {
                client.channels.fetch(airport.channelid)
                .then(channel =>
                    {
                        deleteMessage(channel, island.messageid);
                        deleteMessage(channel, island.warningmessageid);
                    })
                .catch(() => console.log("Could not find airport channel, must have been deleted"));
            })
        .catch(err => console.log(err));
    },

    deleteWarningMessage(client, island)
    {
        airportsDb.getAirport(island.serverid)
        .then(airport =>
            {
                client.channels.fetch(airport.channelid)
                .then(channel =>
                    {
                        deleteMessage(channel, island.warningmessageid);
                    })
                .catch(() => console.log("Could not find airport channel, must have been deleted"));
            })
        .catch(err => console.log(err));
    },

    warn(client, island)
    {
        airportsDb.getAirport(island.serverid)
        .then(airport =>
            {
                client.channels.fetch(airport.channelid)
                .then(channel =>
                    {
                        //delete old warning
                        deleteMessage(channel, island.warningmessageid);

                        //create new warning
                        const remainingTime = moment.duration(closingTime).humanize();
                        let warningMessage = `<@${island.userid}> your island is still open! I will close it automatically in ${remainingTime}\n`;
                        warningMessage += "If you want to keep it open, renew your lease with `!orville renew` or close your island by yourself with `!orville close`";
                        channel.send(warningMessage)
                        .then(message =>
                            {
                                island.warningMessageId = message.id;
                                openIslandsDb.warn(island);
                            })
                        .catch(err => console.log(err));
                    })
                .catch(() => console.log("Could not find airport channel, must have been deleted"));
            })
        .catch(err => console.log(err));
    }
}

function deleteMessage(channel, messageid)
{
    if(messageid)
    {
        channel.messages.fetch(messageid)
        .then(message =>
            {
                message.delete()
                .catch(err => console.log(err));
            })
        .catch(() =>
            {
                console.log("Could not find message, must have already been deleted");
            });
    }
}