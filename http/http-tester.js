const {benchmarkPromise} = require("../benchmark");
const {makeRequest} = require("./requester");
const {parentPort, workerData} = require('worker_threads');

let exit = false;

let currentRequests = 0, totalRequests = 0;
const statuses = {last_response_time: 'waiting'};

function bombard(options, protocol, timeout, concurrent) {
    currentRequests++;
    totalRequests++;
    parentPort.postMessage({ pendingRequests: currentRequests })
    const promise = benchmarkPromise(makeRequest, options, protocol, timeout, false);
    promise.then(({data, time}) => {
        currentRequests--;
        const {status} = data;
        const key = status || data.code;
        statuses[key] = statuses[key] ? ++statuses[key] : 1;
        statuses.last_response_time = time + 'ms';
        parentPort.postMessage({ status: statuses, pendingRequests: currentRequests })
        if (!exit) return bombard(options, protocol, timeout, concurrent);
        if (currentRequests === 0) end();
    })
    if (currentRequests < concurrent && !exit) bombard(options, protocol, timeout, concurrent);
}

const start = () => {
    const { port, concurrent, timeout, urlParams, protocol } = workerData;

    const options = {
        hostname: urlParams.hostname,
        port: port,
        path: urlParams.path,
        method: 'GET',
        timeout
    };

    parentPort.on('message', data => {
        if(data === 'end') exit = true;
    });

    bombard(options, protocol, timeout, concurrent)
};

start();

const end = () => {
    parentPort.postMessage({ended: true, totalRequests});
}
