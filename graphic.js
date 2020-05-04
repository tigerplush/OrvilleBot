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
    getImageBaseUrl(client, island, counter = 0)
    {
        const options = {
            method: 'POST',
            headers:
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(island)
        }
        console.log("Trying to fetch, number of tries: " + counter);
        fetch(wilburAPIUrl + '/fetch', options)
        .then(response => response.json())
        .then(json => {
            if(json.status || counter > 3)
            {
                island.baseUrl = json.dataURL;
            }
            else
            {
                setTimeout(this.getImageBaseUrl, 500, client, island, ++counter);
            }
        })
        .catch(err => console.log(err))
        .finally(client.emit('fetchedUrl', island));
    }
}
