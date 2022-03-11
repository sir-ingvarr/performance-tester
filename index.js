const url = require('url');
const {makeRequest} = require("./requester");
const {benchmarkPromise} = require("./benchmark");
const argv = require('./args');

const address = argv.u;
const portArg = argv.p;
const concurrent = argv.c;
const workTime = argv.t;


const urlParams = url.parse(address);

const urlProtocol = urlParams.protocol;

if(!urlProtocol) throw "protocol is required";

let port;
let protocol;
switch(urlProtocol) {
    case 'https:':
        port = 443;
        protocol = 1;
        break;
    case 'http:':
        port = 80;
        protocol = 0;
        break;
    default:
        console.log(urlProtocol, 'is not supported, using https: instead.');
        protocol = 0;
        port = 443;
}

if(portArg) port = portArg;
if(urlParams.port) port = address.port;

const set = new Set();

const options = {
    hostname: urlParams.hostname,
    port,
    path: urlParams.path,
    method: 'GET'
};

const start = Date.now();
const statuses = {last_response_time: 'waiting'};
let counter = 0;

function bombard() {
    try {
        counter++;
        const promise = benchmarkPromise(makeRequest, options, protocol, false);
        set.add(promise);
        promise.then(({data, time}) => {
            const {status} = data;
            const key = status || data.code;
            statuses[key] = statuses[key] ? statuses[key] += 1 : 1;
            statuses.last_response_time = time + 'ms';
            set.delete(promise);
            if ((Date.now() - start) / 1000 < workTime) return bombard();
            if (set.size === 0) end();
        });
        if (set.size < concurrent && (Date.now() - start) / 1000 < workTime) bombard();
    } catch (e) {
        console.log('request sent:', counter);
        console.log(e);
    }
}

function end() {
    clearInterval(interval);
    logProgress();
    delete statuses.last_response_time;
    console.log('\nended');
    console.log('request sent:', counter);
    console.log(statuses);
}

console.log(`Starting to test ${urlParams.protocol}//${urlParams.hostname}:${port}${urlParams.path} during ${workTime} s.`);

const logProgress = () => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(
        `Time: ${(Date.now() - start) / 1000} s, pending requests: ${set.size}, latest response time: ${statuses.last_response_time}`
    );
}

const interval = setInterval(logProgress, 500);

bombard();

