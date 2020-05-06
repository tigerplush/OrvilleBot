const {databasepath, airportsdb, openislandsdb, userinfodb} = require('../config.json');

const AirportDatabase = require('./AirportDatabase.js');
const IslandDatabase = require('./IslandDatabase');
const UserDatabase = require('./UserDatabase.js');

const airportsDb = new AirportDatabase(databasepath, airportsdb);
const openIslandsDb = new IslandDatabase(databasepath, openislandsdb);
const userDb = new UserDatabase(databasepath, userinfodb);


module.exports.airportsDb = airportsDb;
module.exports.openIslandsDb = openIslandsDb;
module.exports.userDb = userDb;