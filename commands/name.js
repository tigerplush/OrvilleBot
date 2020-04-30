const Discord = require('discord.js');
module.exports =
{
    name: "name",
    usage: "your-name",
    description: "Sets or updates your ingame name. Without a name I will tell you your current name",
    example: [
        ["", "returns your current name"],
        ["Cheddar", "sets your name to 'Cheddar'"],
        ["Gizmo the gremlin", "sets your name to 'Gizmo the gremlin'"]
    ],
    execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("please add your name!");
            return;
        }

        const guildid = message.guild.id;
        const serverInfo = message.client.userInfo
        let userCollection;
        if(serverInfo.has(guildid))
        {
            userCollection = serverInfo.get(guildid);
        }
        else
        {
            userCollection = new Discord.Collection();
            serverInfo.set(guildid, userCollection);
        }
        
        const userid = message.author.id;
        let userInfo;
        if(userCollection.has(userid))
        {
            userInfo = userCollection.get(userid);
        }
        else
        {
            userInfo = {};
            userCollection.set(userid, userInfo);
        }
        userInfo.name = args.join(' ');
        message.reply(" your ingame name is now " + userInfo.name);
        
        message.client.emit('userUpdate', {serverid: guildid, userid: userid, name: userInfo.name});
    },
};