module.exports =
{
    name: "close",
    usage: "",
    description: "Closes your currently open island",
    execute(message, args)
    {
        const bot = message.client;
        let island = bot.openIslands.find(island => island.owner == message.author)
        if(island)
        {
            closingMessage = "Now closing your island";
            if(island.island_name)
            {
                closingMessage += " " + island.island_name;
            }
            message.reply(closingMessage);

            
            let islandIndex = bot.openIslands.indexOf(island);
            bot.openIslands.splice(islandIndex, 1);
            island.arrival_message.delete();
        }
        else
        {
            message.reply("You currently have no open island");
        }
    },
};