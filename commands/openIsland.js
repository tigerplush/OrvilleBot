const {turnipUrl} = require('../config.json');
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
                console.log(island);
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
                            createIsland(message, code, comment, type);
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

function createIsland(message, dodoCode, comment, type)
{
    const client = message.client;
    const serverid = message.guild.id;
    const userid = message.author.id;

    userDb.getUser(serverid, userid)
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
                user.serverid = serverid;
                user.userid = userid;
            }
            user.type = type;
            user.dodoCode = dodoCode;
            user.comment = comment;
            client.emit('openIsland', user);
        });
}