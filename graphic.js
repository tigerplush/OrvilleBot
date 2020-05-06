const fetch = require('node-fetch');
const {wilburAPIUrl} = require('./config.json');

module.exports =
{
    requestImage(client, island)
    {
        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(island)
        }

        fetch(wilburAPIUrl + '/create', options)
            .then(res => res.json())
            .then(console.log("image requested"))
            .catch(err => console.log(err))
            .finally(client.emit('requestSent', island));
    },

    removeImage(island)
    {
        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({serverid: island.serverid, userid: island.userid})
        }

        fetch(wilburAPIUrl + '/remove', options)
            .then(res => res.json())
            .then(json =>
                {
                console.log('Removing image for user ' + island.userid + ' on server ' + island.serverid + ': ' + json.status);
                })
            .catch(err => console.log(err));
    },

    getImageBaseUrl(client, island)
    {
        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(island)
        }

        retryFetch(wilburAPIUrl + '/fetch', options, island)
        .then(json =>
            {
                return json.dataURL;
            })
        .catch(err =>
            {
                console.log(err);
                return;
            })
        .then(dataUrl =>
            {
                island.baseUrl = dataUrl;
                client.emit('fetchedUrl', island);
            });
    }
}

function retryFetch(url, options, island, numberOfRetries = 3)
{
    console.log(`Trying to fetch baseUrl for user ${island.userid} on server ${island.serverid}, number of retries left: ${numberOfRetries}`);
    return new Promise((resolve, reject) =>
    {
        fetch(url, options)
        .then(response => response.json())
        .then(json =>
            {
                if(json.status)
                {
                    resolve(json);
                }
                else
                {
                    throw new Error(`baseUrl for user ${island.userid} on server ${island.serverid} not yet available`);
                }
            })
        .catch(err =>
            {
                if(n === -1)
                {
                    reject(err);
                }
                resolve(retryFetch(url, options, --numberOfRetries));
            });
    });
}