const fetch = require('node-fetch');
const {url} = require('./config.json');

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

        fetch(url + '/create', options)
            .then(res => res.json())
            .then(console.log("image requested"))
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

        fetch(url + '/remove', options)
            .then(res => res.json())
            .then(json => console.log(json));
    },
    async getImageBaseUrl(client, island)
    {
        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(island)
        }

        const response = await fetch(url + '/fetch', options);
        const json = await response.json();
        island.baseUrl = json.dataURL;
        client.emit('fetchedUrl', island)
    }
}
