const moment = require('moment');
const {dodoCodeWaitingTime, defaultUserQueueEmoji} = require('../queueConfig.json');
const {airportsDb, openQueuesDb} = require('../Database/databases.js');

module.exports =
{
    name: "create-queue",
    usage: "",
    description: "Creates a queue for your island",
    example:
        [
            ["", "renews the lease on your island for another 3h"]
        ],
    execute(message, args)
    {
        const waitingTime = moment.duration(dodoCodeWaitingTime);
        const serverid = message.guild.id;
        const userid = message.author.id;

        const comment = args.join(' ');

        let emoji = defaultUserQueueEmoji;

        let queue = {};
        queue.serverid = serverid;
        queue.userid = userid;
        message.author.createDM()
        .catch(err =>
            {
                console.log(err);
                message.reply("your privacy settings don't allow me to send you a DM :frowning:");
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
            return dmChannel.awaitMessages(filter, { max: 1, time: waitingTime.asMilliseconds(), errors: ['time'] });
        })
        .catch(err => console.log(err))
        .then(collectedMessages =>
        {
            const dmMessage = collectedMessages.first();
            const messageContent = dmMessage.content;
            if(/^([a-zA-Z0-9_-]){5}$/.test(messageContent))
            {
                //valid dodo code
                queue.dodoCode = messageContent.toUpperCase();
                dmMessage.channel.send("You have an open queue. This message will get updated when new infos come in")
                .then(updateMessage => 
                    {
                        queue.dmMessageId = updateMessage.id;
                        updateMessage.react('➡');
                    })
                .catch(err => console.log(err));
                return airportsDb.getAirport(serverid);
            }
            else
            {
                collectedMessages.first().reply("Your dodo code is not valid, aborting the queue creating process...")
            }
        })
        .catch(err =>
            {
                console.log(err);
                message.reply("I couldn't find an open airport for your server. Please ask an admin to create one");
            })
        .then(airport =>
            {
                const airportChannel = message.guild.channels.cache.get(airport.channelid);
                if(airportChannel)
                {
                    let queueMessageContent = `<@${userid}> has an open queue!`;
                    if(comment)
                    {
                        queueMessageContent += `(${comment})`;
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
        .catch(err => console.log(err));
    },
};