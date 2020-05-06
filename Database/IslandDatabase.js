const Database = require('./Database.js');

class IslandDatabase extends Database
{
    constructor(pathToDb, dbName)
    {
        super(pathToDb, dbName);
    }

    get(serverid, userid)
    {
        return super.get({serverid: serverid, userid: userid});
    }

    getIsland(island)
    {
        return new Promise((resolve, reject) =>
        {
            this.get(island.serverid, island.userid)
            .then(islands =>
                {
                    if(islands && islands.length > 0)
                    {
                        resolve(islands[0]);
                    }
                    reject(`Couldn't find open island for user ${island.userid} on server ${island.serverid}`);
                })
            .catch(err => reject(err));
        });
    }

    getAll()
    {
        return super.getAll();
    }

    open(island)
    {
        return super.add({
            serverid: island.serverid,
            userid: island.userid,
            messageid: island.arrivalMessageId,
            timestamp: island.timestamp,
            warning: false,
            warningmessageid: ""
        });
    }

    close(island)
    {
        return super.remove(
            {
                serverid: island.serverid,
                userid: island.userid
            });
    }

    warn(island)
    {
        return super.update(
            {serverid: island.serverid, userid: island.userid},
            {warningmessageid: island.warningMessageId, warning: true});
    }

    renew(island)
    {
        return super.update(
            {serverid: island.serverid, userid: island.userid},
            {timestamp: Date.now(), warning: false});
    }
}

module.exports = IslandDatabase;