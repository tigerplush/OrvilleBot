const Datastore = require('nedb');
const Discord = require('discord.js');
const {databasepath, airportsdb, openislandsdb, userinfodb} = require('./config.json');

const airports = new Datastore(databasepath + "/" + airportsdb);
const openIslands = new Datastore(databasepath + "/" + openislandsdb);
const userInfo = new Datastore(databasepath + "/" + userinfodb);
module.exports =
{
    loadDatabases(client)
    {
        airports.loadDatabase();
        airports.find({}, function(err, docs)
        {
            docs.forEach(airport => {
                client.airports.set(airport.serverid, airport.channelid);
            });
        });

        openIslands.loadDatabase();
        openIslands.find({}, function(err, docs)
        {
            docs.forEach(openIsland => {
                //retrieve airport
                let channelid = client.airports.get(openIsland.serverid);
                //retrieve channel where message was posted
                client.channels.fetch(channelid)
                .then(channel => {
                    channel.messages.fetch(openIsland.messageid)
                    .then( message => {
                        let newIsland = {};
                        newIsland.arrival_message = message;
            
                        let user = new Discord.Collection();
                        user.set(openIsland.userid, newIsland);
                        client.openIslands.set(openIsland.serverid, user);
                    })
                    .catch(console.log("Couldn't find the open island message, somebody must have deleted it"));
                })
                .catch(console.log("Couldn't find the channel in the cache, the bot must have been kicked from the server"));
                              
            });
        });

        userInfo.loadDatabase();
        userInfo.find({}, function(err, docs)
        {
            docs.forEach(user => 
                {
                    const userInfo =
                    {
                        name: user.name,
                        island: user.island
                    }
                    const userCollection = new Discord.Collection();
                    userCollection.set(user.userid, userInfo);
                    client.userInfo.set(user.serverid, userCollection);
                });
        });
    },

    updateAirport(airport)
    {
        airports.find({serverid: airport.serverid}, function(err, docs)
        {
            if(docs && docs.length > 0)
            {
                airports.update(
                    {serverid: airport.serverid},
                    {$set: {channelid: airport.channelid}},
                    {},
                    function (){});
            }
            else
            {            
                airports.insert(airport);
            }
        })
    },

    openIsland(islandData)
    {
        openIslands.insert(
            {
                serverid: islandData.guildid,
                userid: islandData.userid,
                messageid: islandData.arrivalMessage.id
            });   
    },

    closeIsland(islandData)
    {
        openIslands.remove(
            {
                serverid: islandData.guildid,
                userid: islandData.userid
            });
    },

    updateUserData(userData)
    {
        userInfo.find(
            {serverid: userData.serverid, userid: userData.userid},
            function(err, docs)
            {
                if(docs && docs.length > 0)
                {
                    if(userData.name)
                    {
                        userInfo.update(
                        {serverid: userData.serverid, userid: userData.userid},
                        {$set: {name: userData.name}},
                        {},
                        function (){});
                    }
                    if(userData.island)
                    {
                        userInfo.update(
                        {serverid: userData.serverid, userid: userData.userid},
                        {$set: {island: userData.island}},
                        {},
                        function (){});
                    }                
                }
                else
                {            
                    userInfo.insert(userData);
                }
            });
    }
}