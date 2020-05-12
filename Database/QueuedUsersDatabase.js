const Database = require('./Database.js');

class QueuedUsersDatabase extends Database
{

    /**
     * 
     * @param {*} userInfo 
     * @returns {Promise} Promise object representing queued user
     */
    getUser(userInfo)
    {
        return new Promise((resolve, reject) =>
        {
            this.get(userInfo)
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        resolve(docs[0]);
                    }
                    reject(`404 - queued user with properties ${JSON.stringify(userInfo)} not found`);
                })
            .catch(err => reject(err));
        })
    }

    getSortedUsers(userInfo)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.find(userInfo).sort({timestamp: 1}).exec(function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    count(userInfo)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.count(userInfo, function(err, numberOfDocuments)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(numberOfDocuments);
            });
        });
    }
}

module.exports = QueuedUsersDatabase;