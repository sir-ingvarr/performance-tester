const https = require('https');
const http = require('http');

const makeRequest = (requestOptions, protocol, timeout) => new Promise((resolve, reject) => {
    const module = protocol === 0 ? http : https;
    const req = module.request(requestOptions, res => {
        const { statusCode: status } = res;
        req.destroy();
        return resolve({ status });
    })

    req.setTimeout(timeout, () => reject({code: 'ETIMEDOUT'}));

    req.on('error', e => {
        reject(e);
    });

    req.end();
});

module.exports = {
    makeRequest,
}
