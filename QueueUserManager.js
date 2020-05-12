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
                dmChannel.send("You are now in a queue")
                .then(dmMessage =>
                    {
                        const queuedUser = {queueid: queue._id, userid: user.id, name: user.username, dmChannelId: dmMessage.channel.id, dmMessageId: dmMessage.id};
                        queuedUsersDb.add(queuedUser)
                        .then(() => this.update(queue, guild))
                        .catch(err => console.log(err));
                    })
                .catch(err => console.log(err));
            })
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
                    Promise.all(removalPromises)
                    .catch(err => console.log(err));
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
                    return this.fetchMessagePromise(queuedUser.dmChannelId, queuedUser.dmMessageId);
                })
            .then(message =>
                {
                    return message.delete();
                })
            .then(() =>
                {
                    return this.fetchMessagePromise(queuedUser.dmChannelId, queuedUser.dodoCodeMessage);
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
        return new Promise((resolve, reject) =>
        {
            console.log(`removing user ${userid} from queue ${queue._id}`);
            queuedUsersDb.getUser({queueid: queue._id, userid: userid})
            .then(queuedUser =>
            {
                // remove entry from database
                queuedUsersDb.remove({queueid: queue._id, userid: queuedUser.userid})
                .then(() => this.update(queue))
                .catch(err => console.log(err));

                this.fetchMessage(queuedUser.dmChannelId, queuedUser.dmMessageId, function(err, message)
                {
                    if(err)
                    {
                        throw new Error(err);
                    }
                    message.delete()
                    .catch(err => console.log(err));
                })

                this.fetchMessage(queuedUser.dmChannelId, queuedUser.dodoCodeMessage, function(err, message)
                {
                    if(err)
                    {
                        throw new Error(err);
                    }
                    message.delete()
                    .catch(err => console.log(err));
                });

                this.fetchChannel(queuedUser.dmChannelId)
                .then(dmChannel =>
                    {
                        resolve(dmChannel);
                    })
                .catch(err => reject(err));
            })
            .catch(err => console.log(err));
        });
        
    }

    update(queue)
    {
        this.fetchQueueDmMessage(queue, (err, message) =>
        {
            if(err)
            {
                console.log(err);
                return;
            }
            this.updateQueueOwnerMessage(message, queue);
        });

        this.updateQueueUsers(queue);

        this.updateQueuePost(queue);
    }

    next(queue)
    {
        //find all users for a queue
        queuedUsersDb.get({queueid: queue._id})
        .then(docs =>
            {
                if(docs && docs.length > 0)
                {
                    return this.remove(docs[0].userid, queue);
                }
            })
        .then(dmChannel =>
            {
                dmChannel.send(`The host has ended your visit. Please requeue if you want to visit again`);
            })
        .catch(err => console.log(err));
        //remove the first ones dodo code
        //remove the first on from database
        //send dodo code to the next one
    }

    updateQueueOwnerMessage(message, queue)
    {
        let queriedUsers;
        queuedUsersDb.get({queueid: queue._id})
        .then(users =>
            {
                queriedUsers = users;
                const userQuery = users.map(user =>
                    {
                        return {serverid: queue.serverid, userid: user.userid};
                    });
                const userPromises = userQuery.map(user => userDb.get(user));
                Promise.all(userPromises)
                .then(docs => docs.map(doc => doc[0]))
                .catch(err => console.log(err))
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

                                    const userInfo = userInfos.find(user => user.userid === users[i].userid);
                                    messageContent += ToMessage(userInfo);

                                    if(i === (queueSize - 1))
                                    {
                                        messageContent += "==================";
                                    }
                                }
                            }
                        }
                        message.edit(messageContent)
                        .catch(err => console.log(err));
                    });
                
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
        queuedUsersDb.get({queueid: queue._id})
        .then(users =>
            {
                users.map((user, index) => this.updateQueueUserMessage(queue, user, index));
            })
        .catch(err => console.log(err));
    }

    updateQueueUserMessage(queue, user, index)
    {
        this.fetchMessagePromise(user.dmChannelId, user.dmMessageId)
        .then(() =>
            {
                if(index < queueSize)
                {
                    //user is allowed onto the island
                    //check if there is already a dodoCode message
                    return queuedUsersDb.get({queueid: queue._id, userid: user.id, dodoCodeMessage: {$exists: true }})
                    .then(docs =>
                        {
                            if(docs && docs.length > 0)
                            {
                                //there is a message, abort
                            }
                            else
                            {
                                //if not, send one
                                return dmChannel.send(`You're up! The dodo code is **${queue.dodoCode}**\nIf you need to do a second trip, please requeue!`)
                                .then(dodoCodeMessage =>
                                    {
                                        queuedUsersDb.update({queueid: queue._id, userid: user.userid}, {dodoCodeMessage: dodoCodeMessage.id})
                                        .catch(err => console.log(err));
                                    });
                            }
                        });
                }
                else
                {
                    //user has to wait
                    return message.edit(`There are ${queueSize - index} people before you`);
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
        airportsDb.getAirport(queue.serverid)
        .then(airport =>
            {
                return this.fetchMessagePromise(airport.channelid, queue.queueMessageId);
            })
        .then(message =>
            {
                let cachedEmoji = message.reactions.cache.first().emoji;
                if(cachedEmoji)
                {
                    emoji = cachedEmoji;
                }
                return queuedUsersDb.count({queueid: queue._id});
            })
        .then(usersInQueue =>
            {
                let queueMessageContent = `**<@${queue.userid}>** has an open queue!`;
                if(queue.comment)
                {
                    queueMessageContent += ` (${queue.comment})`;
                }
                if(usersInQueue)
                {
                    queueMessageContent += `\nThere are currently _${usersInQueue}_ users in this queue`;
                }
                queueMessageContent += `\nReact with ${emoji} to join the queue!`;
                return message.edit(queueMessageContent);
            })
        .catch(err => console.log(err));
    }

    /**
     * Callback for fetching messages
     * @callback fetchedMessage
     * @param {Error} error 
     * @param {Message} message 
     * @param {Channel} channel 
     */

    /**
     * Fetches the queue control dm message
     * @param {*} queue 
     * @param {fetchedMessage} callback signature err, dmMessage
     */
    fetchQueueDmMessage(queue, callback)
    {
        this.fetchMessage(queue.dmChannelId, queue.dmMessageId, callback);
    }

    /**
     * Fetches a message
     * @param {*} channelId 
     * @param {*} messageId 
     * @param {fetchedMessage} callback signature err, message, dmChannel
     */
    fetchMessage(channelId, messageId, callback)
    {
        this.channelManager.fetch(channelId)
        .then(dmChannel =>
            {
                dmChannel.messages.fetch(messageId)
                .then(message =>
                    {
                        callback(undefined, message, message.channel);
                    })
                .catch(err => callback(err));
            })
        .catch(err => callback(err));
    }

    fetchMessagePromise(channelId, messageId)
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
    return message;
}