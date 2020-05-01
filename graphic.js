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
            body: JSON.stringify(island)
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

        fetch(wilburAPIUrl + '/fetch', options)
        .then(response => response.json())
        .then(json => {
            island.baseUrl = json.dataURL;
            client.emit('fetchedUrl', island);
        })
        .catch(err => console.log(err));
    }
}
