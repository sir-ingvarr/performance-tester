const https = require('https');
const http = require('http');

const makeRequest = (requestOptions, protocol, needResponse = true) => new Promise((resolve, reject) => {
    const module = protocol === 0 ? http : https;
    const req = module.request(requestOptions, res => {
        const { statusCode: status } = res;

        if(!needResponse) return resolve({ status });

        let response = Buffer.from('');
        res.on('data', data => {
            response+=data;
        })

        res.on('end', () => {
            resolve({ status, response: response.toString('utf8') });
        });
    })

    req.on('error', e => {
        reject(e);
    });

    req.end();
});

module.exports = {
    makeRequest,
}
