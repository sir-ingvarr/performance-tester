#! node
const url = require('url');
const {Worker} = require("worker_threads");
const argv = require('./args');

const handlers = {
    http: './http/http-tester.js',
    tcp: './tcp/tcp-tester.js'
}

const chooseProtocolAndPort = urlProtocol => {
    switch(urlProtocol) {
        case 'https:':
            return { port: 443, protocol: 1}
        case 'http:':
            return { port: 80, protocol: 0}
        default:
            console.log(urlProtocol, 'is not supported, using https: instead.');
            return { port: 443, protocol: 1}
    }
}

const startTime = Date.now();
let interval;
let currentWorkingTime = 0;
let currentPendingRequests = 0;
let statuses = {};
const workers = new Set();


const start = () => {
    const { a: address, p: portArg, c: concurrent, t: workTime, r, m: mode } = argv;
    const timeout = r * 1000;

    interval = setInterval(() => {
        currentWorkingTime = (Date.now() - startTime) / 1000;
        if(currentWorkingTime >= workTime) workers.forEach(worker => worker.postMessage('end'));
        logProgress()
    }, 500);

    const handlerPath = handlers[mode];
    if(!handlerPath) throw "unsupported requests mode. use tcp or http."

    let port;
    if(portArg) port = portArg;
    const urlParams = url.parse(address);
    if(urlParams.port) port = urlParams.port;
    let res;

    if(mode === 'http') {
        res = chooseProtocolAndPort(urlParams.protocol);
        if(!port) port = res.port;
        console.log(`Starting to test ${urlParams.protocol}//${urlParams.hostname}:${port}${urlParams.path} during ${workTime}s in http mode.`);
    }

    if(mode === 'tcp') {
        if(!port) throw "port is required for tcp mode."
        console.log(`Starting to test ${address}:${port} during ${workTime}s in tcp mode.`);
    }

    const worker = new Worker(handlerPath, {
        workerData: {
            address, port, concurrent, timeout, urlParams, protocol: res?.protocol
        }
    });

    workers.add(worker);

    worker.on('message', data => {
        const { status, pendingRequests, ended, totalRequests } = data;
        if(ended) {
            worker.terminate().then(() => {
                workers.delete(worker);
                if(!workers.length) end(totalRequests);
            });
            return;
        }
        statuses = status;
        currentPendingRequests = pendingRequests;
    });
}

const end = totalRequests => {
    clearInterval(interval);
    logProgress();
    delete statuses.last_response_time;
    console.log('\nended');
    console.log('request sent:', totalRequests);
    console.log(statuses);
    process.exit(0);
}


const logProgress = () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
        `Time: ${currentWorkingTime} s, pending requests: ${currentPendingRequests}, latest response time: ${statuses?.last_response_time || 'loading'}`
    );
}

process.on('SIGINT', end);
process.on('SIGTERM', end);

start();
