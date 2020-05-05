const Datastore = require('nedb');
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
                    reject("No airport for server + " + serverid + " found");
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
                    
                    if(userData.title)
                    {
                        userInfo.update(
                        {serverid: userData.serverid, userid: userData.userid},
                        {$set: {title: userData.title}},
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
                    if(err)
                    {
                        reject(err);
                    }
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
    },
    deleteUser(serverid, userid)
    {
        return new Promise((resolve, reject) =>
        {
            userInfo.remove({serverid: serverid, userid: userid}, function(err, numberOfDeletes)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(numberOfDeletes);
            });
        });
    },
    deleteProperty(serverid, userid, prop)
    {
        return new Promise((resolve, reject) =>
        {
            userInfo.find({serverid, userid}, function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                if(docs && docs.length > 0)
                {
                    user = docs[0];
                    delete user[prop];
                    userInfo.update(
                        {serverid: serverid, userid: userid},
                        user,
                        {},
                        function(err, numberOfUpdates)
                        {
                            if(err)
                            {
                                reject(err);
                            }
                            resolve(numberOfUpdates);
                        });
                }
                else
                {
                    reject(err);
                }
            });
        });
    }
}