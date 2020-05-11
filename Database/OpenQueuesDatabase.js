const Database = require('./Database.js');

class OpenQueuesDatabase extends Database
{
    constructor(pathToDb, dbName)
    {
        super(pathToDb, dbName);
    }

    /**
     * Fetches queue from database
     * @param {*} queueInfo object with queue info to fetch queue from
     * @returns {Promise} Promise object representing queue
     */
    getQueue(queueInfo)
    {
        return new Promise((resolve, reject) =>
        {
            this.get(queueInfo)
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0]);
                    }
                    reject(`404 - queue with properties ${JSON.stringify(queueInfo)} not found`);
                })
            .catch(err => reject(err));
        })
    }
}

module.exports = OpenQueuesDatabase;