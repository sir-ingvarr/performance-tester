const { Socket } = require('net');

const makeRequest = (address, port, timeout) => new Promise((resolve, reject) => {
    const socket = new Socket();

    socket.connect(port, address, () => {
        socket.write('Russian warship fuck off', 'utf-8', () => {
            socket.destroy();
            resolve('success');
        })
    });

    socket.setTimeout(timeout, () => reject({code: 'ETIMEDOUT'}));

    socket.on('error', e => {
        reject(e);
    });
});

module.exports = {
    makeRequest,
}
