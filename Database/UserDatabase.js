const Database = require('./Database.js');

class UserDatabase extends Database
{
    constructor(pathToDb, dbName)
    {
        super(pathToDb, dbName);
    }

    addOrUpdate(user)
    {
        return super.addOrUpdate(
            {serverid: user.serverid, userid: user.userid},
            user);
    }

    getUser(serverid, userid)
    {
        return new Promise((resolve, reject) =>
        {
            this.get({serverid: serverid, userid: userid})
            .then(users =>
                {
                    if(users && users.length > 0)
                    {
                        resolve(users[0]);
                    }
                    reject(`Couldn't find user ${userid} on server ${serverid}`);
                })
            .catch(err => reject(err));
        });
    }

    get(user)
    {
        return super.get(user);
    }

    removeProperty(serverid, userid, prop)
    {
        return new Promise((resolve, reject) =>
        {
            this.getUser(serverid, userid)
            .then(user =>
                {
                    const propertyValue = user[prop];
                    delete user[prop];
                    this.database.update(
                        user,
                        user,
                        {},
                        function(err)
                        {
                            if(err)
                            {
                                reject(err);
                            }
                            resolve(propertyValue);
                        });
                })
            .catch(err => reject(err));
        });
    }

    remove(user)
    {
        return super.remove(user);
    }

    removeUser(serverid, userid)
    {
        return this.remove({serverid: serverid, userid: userid});
    }
}

module.exports = UserDatabase;