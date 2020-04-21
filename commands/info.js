const package = require('../package.json');
module.exports =
{
    name: "info",
    usage: "",
    description: "Gives basic info about Orville",
    execute(message, args)
    {
        let infoString = "";
        infoString += package.name + " v" + package.version + "\n";
        infoString += package.description + "\n";
        infoString += "by " + package.author;
        message.channel.send(infoString);
    },
};