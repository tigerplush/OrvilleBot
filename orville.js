const fs = require('fs');
const Discord = require('discord.js');
const auth = require('./auth.json');
const graphic = require('./graphic.js');
const {prefix, wilburAPIUrl, warningTime, closingTime} = require('./config.json');
const content = require('./content.js');
const message = require('./message.js');

const cron = require('node-cron');
const moment = require('moment');

const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const {airportsDb, openIslandsDb, userDb, openQueuesDb, queuedUsersDb} = require('./Database/databases.js');

const QueueUserManager = require('./QueueUserManager.js');
const queueUserManager = new QueueUserManager(bot.channels);

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    bot.commands.set(command.name, command);
}

//check every 10 minutes
cron.schedule("*/10 * * * *", () =>
{
    openIslandsDb.getAll()
    .then(islands =>
        {
            const warningDuration = moment.duration(warningTime);
            const warning = moment().subtract(warningDuration);
            const closingDuration = moment.duration(closingTime).add(warningDuration);
            const closing = moment().subtract(closingDuration);
            for(island of islands)
            {
                if(warning.diff(island.timestamp) > 0 && island.warning == false)
                {
                    // warn
                    message.warn(bot, island);
                    console.log("Warned user " + island.userid + " on server " + island.serverid);
                }
                if(closing.diff(island.timestamp) > 0)
                {
                    // close
                    console.log("Closing island of user " + island.userid + " on server " + island.serverid);
                    bot.emit('closeIsland', island);
                }
            }
        })
    .catch(err => console.log(err));
});

bot.on('updateAirports', airport => {
    airportsDb.addOrUpdate(airport)
    .catch(err => console.log(err));
});

bot.on('openIsland', island => {
    if(wilburAPIUrl && wilburAPIUrl.length != 0 && island.type === "dodo")
    {
        graphic.requestImage(bot, island);
    }
    else
    {
        bot.emit('fetchedUrl', island);
    }
});

bot.on('closeIsland', island => {
    message.deleteIslandMessage(bot, island)
    openIslandsDb.close(island);
    graphic.removeImage(island);
});

bot.on('islandUpdate', userData => {
    userDb.addOrUpdate(userData)
    .catch(err => console.log(err));
});

bot.on('requestSent', (island) => {
    graphic.getImageBaseUrl(bot, island);
});

bot.on('fetchedUrl', (island) => {
    const arrivalMessageContent = content.create(island);
    let attachment;
    if(island.baseUrl)
    {
        attachment = new Discord.MessageAttachment(Buffer.from(island.baseUrl));
    }
    airportsDb.getAirport(island.serverid)
    .then(airport => {
        bot.channels.fetch(airport.channelid)
        .then(channel =>
            {
                channel.send(arrivalMessageContent, attachment)
                .then(graphMessage =>
                    {
                        island.warning = false;
                        island.timestamp = Date.now();
                        island.arrivalMessageId = graphMessage.id;
                        openIslandsDb.open(island);
                    })
                .catch(err => console.log(err));
            })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});

bot.on('renewLease', (island) => {
    message.deleteWarningMessage(bot, island);
    openIslandsDb.renew(island);
});

bot.on('messageReactionAdd', (messageReaction, user) => {
    if(user.bot)
    {
        return;
    }

    const messageid = messageReaction.message.id;
    const guild = messageReaction.message.guild;

    //check if the reaction was on an open queue
    openQueuesDb.getQueue({queueMessageId: messageid})
    .then(queue =>
        {
            queueUserManager.add(user, queue, guild);
        })
    .catch(err => console.log(err));

    //check if the reaction was on a dm queue message
    openQueuesDb.getQueue({dmMessageId: messageid})
    .then(queue =>
        {
            //this reaction was on a dm queue message, query next queue user
            queueUserManager.next(queue);
        })
    .catch(err => console.log(err));
});

bot.on('messageReactionRemove', (messageReaction, user) => {
    if(user.bot)
    {
        return;
    }

    const messageid = messageReaction.message.id;
    const userid = user.id;

    //check if the reaction was on an open queue
    openQueuesDb.getQueue({queueMessageId: messageid})
    .then(queue =>
        {
            queueUserManager.remove(user.id, queue, guild);
        })
    .catch(err => console.log(err));

    //check if the reaction was on a dm queue message
    openQueuesDb.getQueue({dmMessageId: messageid})
    .then(queue =>
        {
            //this reaction was on a dm queue message, query next queue user
            queueUserManager.next(queue);
        })
    .catch(err => console.log(err));
});

bot.on('ready', () => {
});

bot.on('message', message => {
    if(message.content.startsWith(prefix) && !message.author.bot)
    {
        const args = message.content.slice(prefix.length).split(/ +/);
	    const command = args.shift().toLowerCase();

        if (!bot.commands.has(command))
        {
            return;
        }

        try
        {
            bot.commands.get(command).execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
    
});

bot.login(auth.token)
.catch(err => console.log(err));
