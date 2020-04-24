const Discord = require('discord.js');
module.exports =
{
    name: "island",
    usage: "your-island-name",
    description: "Sets your island name",
    execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("please add your island name!");
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
        userInfo.island = args.join(' ');
        
        message.client.emit('userUpdate', {serverid: guildid, userid: userid, island: userInfo.island});
    },
};