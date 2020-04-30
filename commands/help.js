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
            answer += "Available commands: ";
            commands.map(command => {
                if(!command.hidden)
                {
                    answer += "`" + prefix + command.name + "`, ";
                }
            });
            answer = answer.slice(0, answer.length - 2);
            answer += "\n";
            answer += "To open your island, use `" + prefix + commands.get("open").name + " dodo code` (with your dodo code inserted)\n";
            answer += "To close your island, just type `" + prefix + commands.get("close").name + "`\n";
            answer += "Get more info with `" + prefix + commands.get("help").name +" command`";
        }
        else
        {
            if(commands.has(args[0]))
            {
                command = commands.get(args[0])
                answer += command.name + " " + command.usage + "`\n" + command.description + "\n";
                answer += "Examples:"
                command.example.forEach(example =>
                    {
                        answer += "\n`" + prefix + command.name  + " " + example.join("` => ");
                    });
            }
            else
            {
                answer += args[0] + " is not a valid command";
            }
        }
        message.channel.send(answer);
    },
};