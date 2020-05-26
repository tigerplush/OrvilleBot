const moment = require('moment');

const {defaultUserQueueEmoji, queueSize} = require('./queueConfig.json');

const {airportsDb, userDb, queuedUsersDb} = require('./Database/databases.js');

class QueueUserManager
{
    constructor(channelManager)
    {
        this.channelManager = channelManager;
    }

    add(user, queue, guild)
    {
        console.log(`adding user ${user.id} to queue ${queue._id}`);
        user.createDM()
        .then(dmChannel =>
            {
                return dmChannel.send(`You are now in a queue for ${queue.username}s island`);
            })
        .then(dmMessage =>
            {
                const queuedUser =
                    {
                        queueid: queue._id,
                        userid: user.id,
                        name: user.username,
                        dmChannelId: dmMessage.channel.id,
                        dmMessageId: dmMessage.id,
                        timestamp: Date.now()
                };
                return queuedUsersDb.add(queuedUser);
            })
        .then(() => this.update(queue, guild))
        .catch(err => console.log(err))
    }

    removeAll(queue)
    {
        queuedUsersDb.get({queueid: queue._id})
        .then(queuedUsers =>
            {
                if(queuedUsers && queuedUsers.length > 0)
                {
                    const removalPromises = queuedUsers.map(user => this.removeWithoutUpdate(user));
                    return Promise.all(removalPromises);
                }
            })
        .catch(err => console.log(err));
    }

    removeWithoutUpdate(queuedUser)
    {
        return new Promise((resolve, reject) =>
        {
            this.fetchChannel(queuedUser.dmChannelId)
            .then(dmChannel =>
                {
                    return dmChannel.send("The host closed the queue");
                })
            .then(() =>
                {
                    return this.fetchMessage(queuedUser.dmChannelId, queuedUser.dmMessageId);
                })
            .then(message =>
                {
                    return message.delete();
                })
            .then(() =>
                {
                    return this.fetchMessage(queuedUser.dmChannelId, queuedUser.dodoCodeMessage);
                })
            .then(dodoCodeMessage =>
                {
                    return dodoCodeMessage.delete();
                })
            .then(() =>
                {
                    return queuedUsersDb.remove({queueid: queuedUser.queueid, userid: queuedUser.userid});
                })
            .then(() => resolve())
            .catch(err => reject(err));
        })
    }

    /**
     * 
     * @param {string} userid 
     * @param {*} queue 
     */
    remove(userid, queue)
    {
        console.log(`removing user ${userid} from queue ${queue._id}`);
        queuedUsersDb.getUser({queueid: queue._id, userid: userid})
        .then(queuedUser =>
        {
            // remove entry from database
            queuedUsersDb.remove({queueid: queue._id, userid: queuedUser.userid})
            .then(() => this.update(queue))
            .catch(err => console.log(err));

            this.fetchMessage(queuedUser.dmChannelId, queuedUser.dmMessageId)
            .then(message =>
                {
                    return message.delete();
                })
            .catch(err => console.log(err));

            this.fetchMessage(queuedUser.dmChannelId, queuedUser.dodoCodeMessage)
            .then(message =>
                {
                    return message.delete();
                })
            .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
    }

    update(queue)
    {
        this.fetchMessage(queue.dmChannelId, queue.dmMessageId)
        .then(message => this.updateQueueOwnerMessage(message, queue))
        .catch(err => console.log(err));

        this.updateQueueUsers(queue);

        this.updateQueuePost(queue);
    }

    next(queue)
    {
        //find all users for a queue
        queuedUsersDb.getSortedUsers({queueid: queue._id})
        .then(docs =>
            {
                //remove the first ones dodo code
                //remove the first on from database
                //send dodo code to the next one
                if(docs && docs.length > 0)
                {
                    this.remove(docs[0].userid, queue);
                    return this.fetchChannel(docs[0].dmChannelId);
                }
            })
        .then(dmChannel =>
            {
                //send visit end
                if(dmChannel)
                {
                    dmChannel.send(`The host has ended your visit. Please requeue if you want to visit again`);
                }
            })
        .catch(err => console.log(err));
    }

    updateQueueOwnerMessage(message, queue)
    {
        let queriedUsers;
        queuedUsersDb.getSortedUsers({queueid: queue._id})
        .then(users =>
            {
                queriedUsers = users;
                const userQuery = users.map(user =>
                    {
                        return {serverid: queue.serverid, userid: user.userid};
                    });
                const userPromises = userQuery.map(user => userDb.get(user));
                return Promise.all(userPromises);
            })
        .then(docs =>
            {
                return docs.map(doc => doc[0]);
            })
        .then(userInfos =>
            {
                let messageContent = `You have an open queue with the dodo code **${queue.dodoCode}**.`
                if(queriedUsers)
                {
                    if(queriedUsers.length == 0)
                    {
                        messageContent += " This message will get updated when new infos come in";
                    }
                    else
                    {
                        messageContent += `\nIn your queue are currently ${queriedUsers.length} people:`;
                        for(let i = 0; i < queriedUsers.length; i++)
                        {
                            messageContent += `\n**${queriedUsers[i].name}**`;

                            const userInf = userInfos.find(user => 
                                {
                                    if(user && user.userid === queriedUsers[i].userid)
                                    {
                                        return user;
                                    }
                                });
                            if(userInf)
                            {
                                messageContent += ToMessage(userInf);
                            }

                            if(i === (queueSize - 1))
                            {
                                messageContent += "\n==================";
                            }
                        }
                    }
                    return message.edit(messageContent);
                }
            })
        .catch(err => console.log(err));
    }

    /**
     * Updates all users of a queue
     * @param {*} queue 
     */
    updateQueueUsers(queue)
    {
        //find all messages for all queue users
        queuedUsersDb.getSortedUsers({queueid: queue._id})
        .then(users =>
            {
                users.map((user, index) => this.updateQueueUserMessage(queue, user, index));
            })
        .catch(err => console.log(err));
    }

    updateQueueUserMessage(queue, user, index)
    {
        this.fetchMessage(user.dmChannelId, user.dmMessageId)
        .then(message =>
            {
                let modifier = queue.username.slice(-1) === "s" ? "'" : "s";
                if(index < queueSize && !user.dodoCodeMessage)
                {
                    //user is allowed on the island and there isn't already a dodo code message
                    message.edit(`You're up for **${queue.username}**${modifier} island!`)
                    .catch(err => console.log(err));
                    //send dodo code message
                    return message.channel.send(`The dodo code is **${queue.dodoCode}**\nIf you need to do a second trip, please requeue!`)
                    .then(dodoCodeMessage =>
                        {
                            return queuedUsersDb.update({queueid: queue._id, userid: user.userid}, {dodoCodeMessage: dodoCodeMessage.id, arrivalTimestamp: Date.now()});
                        });
                }
                else if (!user.dodoCodeMessage)
                {
                    //user has to wait
                    let messageContent = `You are now in a queue for **${queue.username}**${modifier} island\n`;
                    if(queueSize !== index)
                    {
                        messageContent += `There are ${index - queueSize} people before you`;
                    }
                    else
                    {
                        messageContent += `You're next!`
                    }
                    return message.edit(messageContent);
                }
            })
        .catch(err => console.log(err));
    }

    /**
     * @todo remove airport from this class by saving the airport channel in open queue?
     * @param {} queue 
     */
    updateQueuePost(queue)
    {
        let emoji = defaultUserQueueEmoji;
        let queuePost;

        let queueOwner = {};
        let queueUsers = [];
        userDb.get({serverid: queue.serverid, userid: queue.userid})
        .then(docs =>
            {
                if(docs && docs.length > 0)
                {
                    queueOwner = docs[0];
                }
                return airportsDb.getAirport(queue.serverid);
            })
        .then(airport =>
            {
                return this.fetchMessage(airport.channelid, queue.queueMessageId);
            })
        .then(message =>
            {
                let cachedEmoji = message.reactions.cache.first().emoji;
                if(cachedEmoji)
                {
                    emoji = cachedEmoji;
                }
                queuePost = message;
                return queuedUsersDb.getSortedUsers({queueid: queue._id});
            })
        .then(usersInQueue =>
            {
                queueUsers = usersInQueue;

                const userInfoPromises = queueUsers.map(user => userDb.get({serverid: queue.serverid, userid: user.userid}));

                return Promise.all(userInfoPromises);
            })
        .then(userInfoArray =>
            {
                const userInfos = userInfoArray.reduce((acc, val) => acc.concat(val), []);
                let queueMessageContent = ToQueuePost(queue, queueOwner, queueUsers, emoji, userInfos);
                return queuePost.edit(queueMessageContent);
            })
        .catch(err => console.log(err));
    }

    close(queue)
    {
        // delete waiting messages for all users
    // send all users "the queue has been closed"
        this.removeAll(queue);

        //find airport
        airportsDb.getAirport(queue.serverid)
        .then(airport =>
            {
                //fetch queue message
                return this.fetchMessage(airport.channelid, queue.queueMessageId)
            })
        .then(queueMessage =>
            {
                // delete message
                return queueMessage.delete();
            })
        .catch(err => console.log(err));

        //edit dm queue message
        this.fetchMessage(queue.dmChannelId, queue.dmMessageId)
        .then(dmMessage =>
            {
                return dmMessage.edit(`You have closed your queue with the dodo code **${queue.dodoCode}**`);
            })
        .catch(err => console.log(err));
    }

    fetchMessage(channelId, messageId)
    {
        return new Promise((resolve, reject) =>
        {
            this.channelManager.fetch(channelId)
            .then(dmChannel =>
                {
                    return dmChannel.messages.fetch(messageId);
                })
            .then(message =>
                {
                    resolve(message);
                })
            .catch(err => reject(err));
        });
    }

    fetchChannel(channelid)
    {
        return this.channelManager.fetch(channelid);
    }
}

module.exports = QueueUserManager;

/**
 * Stringifies user information
 * @todo move to a userInfo class
 * @param {*} userInfo 
 */
function ToMessage(userInfo)
{
    let message = "";
    if(userInfo.name)
    {
        message += ` (_${userInfo.name}_)`;
    }
    if(userInfo.island)
    {
        message += ` from ${userInfo.island}`;
    }

    const visitDuration = moment(userInfo.arrivalTimestamp).fromNow();
    message += ` (_joined ${visitDuration}_)`;
    return message;
}

function ToQueuePost(queue, queueOwner, usersInQueue, emoji, userInfos)
{
    let queueMessageContent = `**<@${queue.userid}>**`;

    if(queueOwner.name)
    {
        queueMessageContent += ` (_${queueOwner.name}_)`;
    }

    queueMessageContent += ` has an open queue`;
    if(queueOwner.island)
    {
        queueMessageContent += ` for ${queueOwner.island}`;
    }
    queueMessageContent += `!`;

    if(queue.comment)
    {
        queueMessageContent += ` (${queue.comment})`;
    }
    if(usersInQueue && usersInQueue.length > 0)
    {
        queueMessageContent += `\nThere are currently _${usersInQueue.length}_ users in this queue`;
        queueMessageContent += `\nOn the island are currently:`
        usersInQueue.forEach((element, index) =>
        {
            if(index < queueSize)
            {
                const number = ToName(index + 1);
                const visitDuration = moment(element.arrivalTimestamp).fromNow();
                queueMessageContent += `\n :${number}: <@!${element.userid}>`;
                const userInfo = userInfos.find(user => user.userid === element.userid);
                if(userInfo)
                {
                    if(userInfo.name)
                    {
                        queueMessageContent += ` (_${userInfo.name}_)`;
                    }
                    if(userInfo.island)
                    {
                        queueMessageContent += ` from ${userInfo.island}`
                    }
                }
                queueMessageContent += ` (_joined ${visitDuration}_)`;
            }
        })
    }
    queueMessageContent += `\nReact with ${emoji} to join the queue!`;
    queueMessageContent += `\nPlease remove your reaction when you're finished - please requeue for each trip`;
    return queueMessageContent;
}

function ToName(number)
{
    const names =
    [
        "zero"
        ,"one"
        ,"two"
        ,"three"
        ,"four"
        ,"five"
        ,"six"
        ,"seven"
        ,"eight"
        ,"nine"
    ];

    return names[number];
}