const moment = require('moment');
const {dodoCodeWaitingTime, defaultUserQueueEmoji} = require('../queueConfig.json');
const {airportsDb, openIslandsDb, openQueuesDb} = require('../Database/databases.js');

const codeChecker = require('../codeChecker.js');

class QueueError extends Error
{
    constructor(message)
    {
        super(message);
    }
}

module.exports =
{
    name: "create-queue",
    usage: "",
    description: "Creates a queue for your island. Orville will dm you to ask you for the code",
    example:
        [
            ["", "creates a queue for your island. Orville will dm you to ask you for the code"]
            ["turnips for 600 Bells!!!", "creates a queue for your island with the comment 'turnips for 600 Bells!!!'. Orville will dm you to ask you for the code"]
        ],
    execute(message, args)
    {
        const serverid = message.guild.id;
        const userid = message.author.id;

        const waitingTime = moment.duration(dodoCodeWaitingTime);

        const comment = args.join(' ');

        let emoji = defaultUserQueueEmoji;

        let queue = {};
        queue.serverid = serverid;
        queue.userid = userid;
        queue.username = message.author.username;

        openQueuesDb.get(queue)
        .then(docs =>
            {
                if(docs && docs.length > 0)
                {
                    throw new QueueError("you already have an open queue!");
                }
                else
                {
                    return openIslandsDb.get(queue);
                }
            })
        .then(docs =>
            {
                if(docs && docs.length > 0)
                {
                    throw new QueueError("you already have an open island!");
                }
                else
                {
                    return message.author.createDM()
                    .catch(err =>
                        {
                            throw new QueueError("I couldn't send you a dm");
                        });
                }
            })
        .then(dmChannel =>
            {
                queue.dmChannelId = dmChannel.id;
                return dmChannel.send(`Please dm me your dodo code withing the next ${waitingTime.humanize()}`);
            })
        .then(dodoMessage =>
            {
                const dmChannel = dodoMessage.channel;
                const filter = dm => dm;
                return dmChannel.awaitMessages(filter, { max: 1, time: waitingTime.asMilliseconds(), errors: ['time'] })
                .catch(err =>
                    {
                        throw new QueueError("I haven't received a dodo code");
                    });
            })
        .then(collectedMessages =>
            {
                const dmMessage = collectedMessages.first();
                const messageContent = dmMessage.content;
                if(codeChecker.checkDodo(messageContent))
                {
                    //valid dodo code
                    queue.dodoCode = messageContent.toUpperCase();
                    return dmMessage.channel.send(`You have an open queue with the dodo code **${queue.dodoCode}**. This message will get updated when new infos come in`);
                }
                throw new QueueError("Your dodo code is not valid, aborting the queue creating process...");
            })
        .then(updateMessage =>
            {
                queue.dmMessageId = updateMessage.id;
                return updateMessage.react('➡');
            })
        .then(() =>
            {
                return airportsDb.getAirport(serverid)
                .catch(err =>
                    {
                        throw new QueueError("I couldn't find an airport for your server - please ask an admin to create one");
                    });
            })
        .then(airport =>
            {
                const airportChannel = message.guild.channels.cache.get(airport.channelid);
                if(airportChannel)
                {
                    let queueMessageContent = `<@${userid}> has an open queue!`;
                    if(comment)
                    {
                        queueMessageContent += ` (${comment})`;
                        queue.comment = comment;
                    }

                    if(airport.emoji)
                    {
                        let newEmoji = message.guild.emojis.cache.find(reaction => reaction.name === airport.emoji);
                        if(newEmoji)
                        {
                            emoji = newEmoji;
                        }
                        else
                        {
                            emoji = airport.emoji;
                        }
                    }

                    queueMessageContent += `\nReact with ${emoji} to join the queue! (If I don't dm you, you probably have to check your privacy settings)`;
                    return airportChannel.send(queueMessageContent);
                }
            })
        .then(queueMessage =>
            {
                queue.queueMessageId = queueMessage.id;
                return queueMessage.react(emoji);
            })
        .then(() =>
            {
                openQueuesDb.add(queue);
            })
        .catch(err =>
            {
                if(err instanceof QueueError)
                {
                    message.reply(err.message);
                }
                console.log(err);
            });
    },
};