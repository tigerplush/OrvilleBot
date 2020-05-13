module.exports =
{
    checkDodo(string)
    {
        const dodoCodeChecker = new RegExp("^(?:(?=[^IOZ])[A-Z0-9]){5}$", "i");
        return dodoCodeChecker.test(string);
    },

    checkTurnip(string)
    {
        const turnipCodeChecker = new RegExp("^([A-Z0-9]){8}$", "i");
        return turnipCodeChecker.test(string);
    },

    checkTurnipUrl(string)
    {
        const turnipUrlChecker = new RegExp("(http(s)?:\/\/.)?(www\.)?turnip\.exchange\/island\/([A-Z0-9]){8}$", "i");
        return turnipUrlChecker.test(string);
    }
}