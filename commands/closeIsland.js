module.exports =
{
    name: "close",
    usage: "",
    description: "Closes your currently open island",
    execute(message, args)
    {
        const bot = message.client;
        const guildid = message.guild.id;
        const userid = message.author.id;
        let island = bot.openIslands.get(guildid).get(userid);
        if(island)
        {
            closingMessage = "now closing your island";
            if(island.island_name)
            {
                closingMessage += " " + island.island_name;
            }
            message.reply(closingMessage);
            
            bot.openIslands.get(guildid).delete(userid);
            island.arrival_message.delete();
            bot.emit('closeIsland', {guildid: guildid, userid: userid});
        }
        else
        {
            message.reply("you currently have no open island");
        }
    },
};