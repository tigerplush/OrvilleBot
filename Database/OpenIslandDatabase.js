const Database = require('./Database.js');

class OpenIslandDatabase extends Database
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
            warning: false
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
        super.update(
            {serverid: island.serverid, userid: island.userid},
            {warningmessageid: island.warningmessageid, warning: true})
            .catch(err => console.log(err));
    }

    renew(island)
    {
        super.update(
            {serverid: island.serverid, userid: island.userid},
            {timestamp: Date.now(), warning: false})
            .catch(err => console.log(err));
        this.database.update(
            {serverid: island.serverid, userid: island.userid},
            {$unset: {warningmessageid: true}},
            {},
            function(err)
            {
                console.log(err);
            }
        );
    }
}

module.exports = OpenIslandDatabase;