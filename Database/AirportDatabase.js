const Database = require('./Database.js');

class AirportDatabase extends Database
{
    constructor(pathToDb, dbName)
    {
        super(pathToDb, dbName);
    }

    get(airport)
    {
        return super.get(airport);
    }

    getAirport(serverid)
    {
        return new Promise((resolve, reject) => {
            super.get({serverid: serverid})
            .then(airports =>
                {
                    if(airports && airports.length > 0)
                    {
                        resolve(airports[0]);
                    }
                    reject(`No airport for server ${serverid} found`);
                })
            .catch(err => reject(err));
        });
    }

    addOrUpdate(airport)
    {
        return super.addOrUpdate({serverid: airport.serverid}, airport);
    }
}

module.exports = AirportDatabase;