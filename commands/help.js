const {prefix} = require('../config.json');
module.exports =
{
    name: "help",
    usage: "",
    description: "Gives a short explanation of usage",
    execute(message, args)
    {
        const {commands} = message.client;
        
        let answer = "";
        answer += prefix;
        if(!args.length)
        {
            answer += this.name + "\n" + this.description + "\nAvailable commands: " + commands.map(command => command.name).join(', ') + "\nGet more info with !help <command>";
        }
        else
        {
            if(commands.has(args[0]))
            {
                command = commands.get(args[0])
                answer += command.name + " " + command.usage + "\n" + command.description;
            }
            else
            {
                answer += args[0] + " is not a valid command";
            }
        }
        message.channel.send(answer);
    },
};