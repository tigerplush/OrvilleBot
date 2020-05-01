module.exports =
{
    create(island)
    {        
        let arrivalMessageContent = "<@" + island.userid + ">";
        
        if(island.name)
        {
            arrivalMessageContent += " (_" + island.name + "_)";
        }
        if(island.island)
        {
            arrivalMessageContent += " from " + island.island;
        }
        arrivalMessageContent += ": **" + island.dodoCode + "**";
        
        if(island.comment)
        {
            arrivalMessageContent += " (" + island.comment + ")";
        }
        return arrivalMessageContent;
    }
}
