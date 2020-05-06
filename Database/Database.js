const Datastore = require('nedb');
const path = require('path');
const fs = require('fs');
/**
 * Contains basic database functions
 * @class
 */
class Database
{
    /**
     * Creates a new datastore and loads the correspinding database
     * @param {string} pathToDb path to database
     * @param {string} dbName name of the database
     */
    constructor(pathToDb, dbName)
    {
        if(!fs.existsSync(pathToDb))
        {
            fs.mkdirSync(pathToDb);
        }
        this.database = new Datastore(path.join(pathToDb, dbName));
        this.database.loadDatabase();
    }

    /**
     * Inserts a document into the database
     * @param {*} doc document to add
     * @returns {Promise} empty promise
     */
    add(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.insert(doc, function(err)
            {
                if(err)
                {
                    reject(err);
                }
                resolve();
            })
        });
    }

    /**
     * Updates a document in the database
     * @param {*} doc document to update
     * @param {*} updateProperties properties to update
     * @returns {Promise} empty promise
     */
    update(doc, updateProperties)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.update(
                doc,
                {$set: updateProperties},
                {},
                function (err, numberOfUpdates)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    resolve(numberOfUpdates);
                });
        });
    }

    /**
     * Adds a document or updates it, if it already exists
     * @param {*} doc doc find or update
     * @param {*} updateProperties properties to add or update
     * @returns {Promise}
     */
    addOrUpdate(doc, updateProperties)
    {
        return new Promise((resolve, reject) => {
            this.get(doc)
            .then(docs =>
                {
                    if(docs && docs.length > 0)
                    {
                        //document exists => update
                        this.update(doc, updateProperties)
                        .then(() => resolve())
                        .catch(err => reject(err));
                    }
                    else
                    {
                        //add document
                        this.add(updateProperties)
                        .then(() => resolve())
                        .catch(err => reject(err));
                    }
                })
            .catch(err => reject(err));
        });
    }

    /**
     * Finds a document in the database
     * @param {*} doc document to find
     * @returns {Promise} promise to found document
     */
    get(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.find(doc, function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    /**
     * Finds all documents in a database
     * @returns {Promise} promise to all documents
     */
    getAll()
    {
        return new Promise((resolve, reject) =>
        {
            this.database.find({}, function(err, docs)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(docs);
            });
        });
    }

    /**
     * Removes a document from the database
     * @param {*} doc document to remove
     * @returns {Promise<number>} promise to number of removed documents
     */
    remove(doc)
    {
        return new Promise((resolve, reject) =>
        {
            this.database.remove(doc, function(err, numberOfDeletes)
            {
                if(err)
                {
                    reject(err);
                }
                resolve(numberOfDeletes);
            });
        })
    }
}

module.exports = Database;