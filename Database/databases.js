const {databasepath, airportsdb, openislandsdb, userinfodb, openqueuedb, queuedusersdb} = require('../config.json');

const AirportDatabase = require('./AirportDatabase.js');
const OpenIslandDatabase = require('./OpenIslandDatabase.js');
const UserDatabase = require('./UserDatabase.js');
const OpenQueuesDatabase = require('./OpenQueuesDatabase.js');
const QueuedUsersDatabase = require('./QueuedUsersDatabase.js');

const airportsDb = new AirportDatabase(databasepath, airportsdb);
const openIslandsDb = new OpenIslandDatabase(databasepath, openislandsdb);
const userDb = new UserDatabase(databasepath, userinfodb);
const openQueuesDb = new OpenQueuesDatabase(databasepath, openqueuedb);
const queuedUsersDb = new QueuedUsersDatabase(databasepath, queuedusersdb);


module.exports.airportsDb = airportsDb;
module.exports.openIslandsDb = openIslandsDb;
module.exports.userDb = userDb;
module.exports.openQueuesDb = openQueuesDb;
module.exports.queuedUsersDb = queuedUsersDb;