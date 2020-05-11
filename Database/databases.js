const {databasepath, airportsdb, openislandsdb, userinfodb} = require('../config.json');

const AirportDatabase = require('./AirportDatabase.js');
const OpenIslandDatabase = require('./OpenIslandDatabase.js');
const UserDatabase = require('./UserDatabase.js');

const airportsDb = new AirportDatabase(databasepath, airportsdb);
const openIslandsDb = new OpenIslandDatabase(databasepath, openislandsdb);
const userDb = new UserDatabase(databasepath, userinfodb);


module.exports.airportsDb = airportsDb;
module.exports.openIslandsDb = openIslandsDb;
module.exports.userDb = userDb;