const {turnipUrl, ping} = require('../config.json');
const {airportsDb, openIslandsDb, userDb} = require('../Database/databases.js');

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
                    message.reply("you already have an island open");
                    return;
                }
                else
                {
                    // no open island
                    //fetch airport channel
                    airportsDb.getAirport(serverid)
                    .then(airport =>
                        {
                            const comment = args.join(' ');
                            createIsland(serverid, userid, code, comment, type, function(err, island)
                            {
                                if(err)
                                {
                                    console.log(err);
                                    message.reply("there is an error in the database, please contact an admin to fix that");
                                }
                                else
                                {
                                    const codeword = comment.match(new RegExp(ping.word, "i"));
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
                                        island.ping = pingRole.id;
                                    }
                                    message.client.emit('openIsland', island);
                                }
                            });
                        })
                    .catch(err =>{
                        console.log(err);
                        message.reply("I couldn't find an open airport for your server. Please ask an admin to create one");
                    });
                }
            })
        .catch(err => console.log(err));
    },
};

/**
 * Callback for creating an island
 * @callback createIslandCallback
 * @param {*} err 
 * @param {*} island 
 */

/**
 * 
 * @param {*} serverid 
 * @param {*} userid 
 * @param {*} dodoCode 
 * @param {*} comment 
 * @param {*} type 
 * @param {createIslandCallback} callback callback, signature err, island
 */
function createIsland(serverid, userid, dodoCode, comment, type, callback)
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
            callback(undefined, island);
        })
    .catch(err =>
        {
            callback(err, undefined);
        });
}