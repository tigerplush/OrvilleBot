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

        fetch(url + '/remove', options)
            .then(res => res.json())
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

        fetch(url + '/fetch', options)
        .then(response => response.json())
        .then(json => {
            island.baseUrl = json.dataURL;
            client.emit('fetchedUrl', island)
        })
        .catch(err => console.log(err));
        
        
    }
}
