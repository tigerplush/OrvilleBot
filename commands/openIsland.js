const Discord = require('discord.js');

module.exports =
{
    name: "open",
    usage: "dodo-code (comment)",
    description: "Opens your island. Dodo code is mandatory, comments (e.g. for turnip prices or diy recipes) is optional",
    example:
        [
            ["ASDFG", "opens an island with the dodo code 'ASDFG'"],
            ["ASDFG turnip prices 603!!!", "opens an island with the dodo code 'ASDFG' and the comment 'turnip prices 603!!!'"]
        ],
    execute(message, args)
    {
        // check if the dodo code is there
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code!")
            return;
        }

        // check if the dodo code is valid
        let dodoCode = args.shift();
        if(! /^([a-zA-Z0-9_-]){5}$/.test(dodoCode))
        {
            message.reply("Your dodo code is invalid!");
            return;
        }
        dodoCode = dodoCode.toUpperCase();

        const bot = message.client;
        const database = bot.database;

        const serverid = message.guild.id;
        const userid = message.author.id;

        //check if user has an island open
        database.getOpenIsland(serverid, userid)
        .then(island => {
            //yes
            // todo: update island ? update comment? update dodo code?
            message.reply("you already have an island open");
        })
        .catch(err =>{
            // no open island
            console.log(err);
            //fetch airport channel
            database.getAirport(serverid)
            .then(airport =>
                {
                    const comment = args.join(' ');
                    createIsland(message, dodoCode, comment);
                })
            .catch(err =>{
                console.log(err);
                message.reply("I couldn't find an open airport for your server. Please ask an admin to create one");
            });
        });
    },
};

function createIsland(message, dodoCode, comment)
{
    const client = message.client;
    const database = client.database;
    const serverid = message.guild.id;
    const userid = message.author.id;

    database.getUser(serverid, userid)
    .then(user =>
        {
            return user;
        })
    .catch(err =>
        {
            console.log(err);
        })
    .then(user =>
        {
            if(!user)
            {
                user = {};
            }
            user.dodoCode = dodoCode;
            user.title = comment;
            client.emit('openIsland', user);
        });
}