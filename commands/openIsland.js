module.exports =
{
    name: "open",
    usage: "<dodo code> (Ingame name) (Island name)",
    description: "Opens your island. Dodo code is mandatory, ingame name and island name can be omitted",
    async execute(message, args)
    {
        if(args.length < 1)
        {
            message.reply("Please provide a dodo code!")
            return;
        }

        const bot = message.client;

        //Create an island
        let islandName = "";

        for(let i = 2; i < args.length; i++)
        {
            islandName += args[i] + " ";
        }

        islandName = islandName.trim();
        
        let newIsland = {
            "owner": message.author,
            "dodo_code": args[0],
            "user_name": args[1],
            "island_name": islandName
        };

        //Check if island is open
        if( bot.openIslands.find(island => island.owner == newIsland.owner) )
        {
            //Yes island is already open
            message.channel.send("You already have an island open");
        }
        else
        {
            //No, island is not open yet
            let arrivalMessageContent = "<@" + message.author.id + ">";
            if(newIsland.user_name)
            {
                arrivalMessageContent += " (_" + newIsland.user_name + "_) ";
            }
            if(newIsland.island_name)
            {
                arrivalMessageContent += "from " + newIsland.island_name;
            }
            arrivalMessageContent += ": **" + newIsland.dodo_code + "**";

            let currentAirport = bot.airports.find(airport => airport.guild == message.guild);
            let arrivalMessage = await currentAirport.send(arrivalMessageContent);
            newIsland.arrival_message = arrivalMessage;
            bot.openIslands.push(newIsland);
        }
    },
};