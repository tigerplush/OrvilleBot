const {turnipUrl, ping} = require('../config.json');
const {airportsDb, openIslandsDb, userDb} = require('../Database/databases.js');

class OpenIslandError extends Error
{
    constructor(message)
    {
        super(message);
    }
}

module.exports =
{
    name: "open",
    usage: "dodo-code/turnip.exchange-code/turnip.exchange-link (comment)",
    description: "Opens your island. Dodo code, turnip.exchange code or turnip.exchange link is mandatory, comments (e.g. for turnip prices or diy recipes) is optional",
    example:
        [
            ["ASDFG", "opens an island with the dodo code 'ASDFG'"],
            ["ASDFG turnip prices 603!!!", "opens an island with the dodo code 'ASDFG' and the comment 'turnip prices 603!!!'"],
            ["a263f37c", "opens an island with the turnip exchange link pointing to https://turnip.exchange/island/a263f37c"],
            ["https://turnip.exchange/island/a263f37c turnip prices 603!!!", "opens an island with the turnip exchange link pointing to https://turnip.exchange/island/a263f37c and the comment 'turnip prices 603!!!'"]
        ],
    execute(message, args)
    {
        // check if the dodo code is there
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code, turnip.exchange code or a turnip.exchange link!");
            return;
        }

        let code;
        let type;
        const input = args.shift();
        //check if the input is valid
        if(/^([a-zA-Z0-9_-]){5}$/.test(input))
        {
            //valid dodo code
            code = input.toUpperCase();
            type = "dodo";
        }
        else if(/^([a-zA-Z0-9_-]){8}$/.test(input))
        {
            //valid turnip code
            code = turnipUrl + input.toLowerCase();
            type = "turnip.exchange";
        }
        else if(/(http(s)?:\/\/.)?(www\.)?turnip\.exchange\/island\/([a-zA-Z0-9]){8}$/.test(input))
        {
            //valid turnip.exchange link
            code = input.toLowerCase();
            type = "turnip.exchange";
        }
        else
        {
            message.reply("please provide a dodo code, turnip.exchange code or turnip.exchange link");
            return;
        }

        const serverid = message.guild.id;
        const userid = message.author.id;

        //check if user has an island open
        openIslandsDb.get(serverid, userid)
        .then(island =>
            {
                if(island && island.length > 0)
                {
                    //yes
                    // todo: update island ? update comment? update dodo code?
                    throw new OpenIslandError("you already have an island open");
                }
                {
                }
                return airportsDb.getAirport(serverid)
                .catch(err =>
                    {
                        return new OpenIslandError("I couldn't find an open airport for your server. Please ask an admin to create one");
                    });
            })
        .then(() =>
            {
                const comment = args.join(' ');
                return createIslandPromise(serverid, userid, code, comment, type)
                .catch(err =>
                    {
                        throw new OpenIslandError("I couldn't find an airport for your server - please ask an admin to create one");
                    });
            })
        .then(island =>
        {
            const codeword = island.comment.match(new RegExp(ping.word, "i"));
            const threshold = args.filter(word =>
                {
                    if(Number(word) && Number(word) >= ping.threshold)
                    {
                        return Number(word);
                    }
                });
            if(codeword && codeword.length > 0 && threshold && threshold.length > 0)
            {
                const pingRole = message.guild.roles.cache.find(role => role.name === ping.role);
                if(pingRole)
                {
                    island.ping = pingRole.id;
                }
            }
            message.client.emit('openIsland', island);
        })
        .catch(err =>
            {
                if(err instanceof OpenIslandError)
                {
                    message.reply(err.message);
                }
                console.log(err)
            });
    },
};

function createIslandPromise(serverid, userid, dodoCode, comment, type)
{
    return new Promise((resolve, reject) =>
    {
        userDb.get({serverid: serverid, userid: userid})
        .then(docs =>
            {
                let island = {};
                if(docs && docs.length)
                {
                    island = docs[0];
                }
                else
                {
                    island.serverid = serverid;
                    island.userid = userid;
                }
                island.dodoCode = dodoCode;
                island.comment = comment;
                island.type = type;
                resolve(island);
            })
        .catch(err => reject(err));
    });
}