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
        answer += "`" + prefix;
        if(!args.length)
        {
            answer += this.name + "`\n" + this.description + "\n";
            answer += "Available commands: `" + prefix + commands.map(command => command.name).join('`, `' + prefix) + "`\n";
            answer += "To open your island, use `!open <dodo_code>` (with your dodo code inserted)\n";
            answer += "To close your island, just type `!close`\n";
            answer += "Get more info with `!help <command>`";
        }
        else
        {
            if(commands.has(args[0]))
            {
                command = commands.get(args[0])
                answer += command.name + " " + command.usage + "`\n" + command.description;
            }
            else
            {
                answer += args[0] + " is not a valid command";
            }
        }
        message.channel.send(answer);
    },
};