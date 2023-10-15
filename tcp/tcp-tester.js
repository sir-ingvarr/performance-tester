const {benchmarkPromise} = require("../benchmark");
const {makeRequest} = require("./requester");
const {parentPort, workerData} = require('worker_threads');

let exit = false;

let currentRequests = 0, totalRequests = 0;
const statuses = {last_response_time: 'waiting'};

function bombard(address, port, timeout, concurrent) {
    currentRequests++;
    totalRequests++;
    parentPort.postMessage({ pendingRequests: currentRequests })
    const promise = benchmarkPromise(makeRequest, address, port, timeout);
    promise.then(({data, time}) => {
        currentRequests--;
        const {status} = data;
        const key = status || data.code;
        statuses[key] = statuses[key] ? statuses[key] += 1 : 1;
        statuses.last_response_time = time + 'ms';
        parentPort.postMessage({ status: statuses, pendingRequests: currentRequests })
        if (!exit) return bombard(address, port, timeout, concurrent);
        if (currentRequests === 0) end();
    })
    if (currentRequests < concurrent && !exit) bombard(address, port, timeout, concurrent);
}

const start = () => {
    const { address, port, concurrent, timeout } = workerData;


    parentPort.on('message', data => {
        if(data === 'end') exit = true;
    });

    bombard(address, port, timeout, concurrent)
};

start();

const end = () => {
    parentPort.postMessage({ended: true, totalRequests});
}
