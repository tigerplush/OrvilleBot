const Datastore = require('nedb');
const Discord = require('discord.js');
const {databasepath, airportsdb, openislandsdb, userinfodb} = require('./config.json');

const airports = new Datastore(databasepath + "/" + airportsdb);
const openIslands = new Datastore(databasepath + "/" + openislandsdb);
const userInfo = new Datastore(databasepath + "/" + userinfodb);
module.exports =
{
    loadDatabases()
    {
        airports.loadDatabase();
        openIslands.loadDatabase();
        userInfo.loadDatabase();
    },

    getAirport(serverid)
    {
        return new Promise((resolve, reject) =>
        {
            airports.find({serverid: serverid}, function(err, docs)
            {
                if(docs && docs.length > 0)
                {
                    resolve(docs[0]);
                }
                else
                {
                    reject("No airport found");
                }
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

    getOpenIsland(serverid, userid)
    {
        return new Promise((resolve, reject) =>
        {
            openIslands.find({serverid: serverid, userid: userid}, function(err, docs)
            {
                if(docs && docs.length > 0)
                {
                    resolve(docs[0]);
                }
                else
                {
                    reject("No open island found");
                }
            });
        });
    },

    openIsland(island)
    {
        openIslands.insert(
            {
                serverid: island.serverid,
                userid: island.userid,
                messageid: island.arrivalMessageId
            });
    },

    closeIsland(island)
    {
        openIslands.remove(
            {
                serverid: island.serverid,
                userid: island.userid
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
    },
    getUser(serverid, userid)
    {
        return new Promise((resolve, reject) =>
        {
            userInfo.find(
                {serverid: serverid, userid: userid},
                function(err, docs)
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0]);
                    }
                    else
                    {
                        reject("No user with this server- or userid found");
                    }
                });
        });
    }
}