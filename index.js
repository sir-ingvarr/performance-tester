const {makeRequest} = require("./requester");
const {benchmarkPromise} = require("./benchmark");
const yargs = require('yargs');
const {hideBin} = require("yargs/helpers");
const url = require('url');

const argv = yargs(hideBin(process.argv))
    .options({
        u: {
            alias: 'url',
            demandOption: true,
            default: 'http://localhost',
            describe: 'url to query',
            type: 'string'
        },
        p: {
            alias: 'port',
            describe: 'port',
            type: 'number'
        },
        t: {
            alias: 'time',
            demandOption: true,
            default: '60',
            describe: 'time in seconds to send requests',
            type: 'number'
        },
        c: {
            alias: 'concurrent',
            demandOption: true,
            default: '1000',
            describe: 'number of concurrent requests',
            type: 'number'
        }
    })
    .help()
    .argv

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
const statuses = {};
let counter = 0;

function bombard() {
    try {
        counter++;
        process.stdout.write(`\r TIME: ${(Date.now() - start) / 1000} s, requests: ${set.size}`);
        const promise = benchmarkPromise(makeRequest, options, protocol, false);
        set.add(promise);
        promise.then(({data}) => {
            const {status} = data;
            const key = status || data.code;
            statuses[key] = statuses[key] ? statuses[key] += 1 : 1;
            set.delete(promise);
            process.stdout.write(`\r TIME: ${(Date.now() - start) / 1000} s, requests: ${set.size}`);
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
    console.log('\nended');
    console.log(statuses);
}

console.log('Starting to test', urlParams.hostname, 'on port', port, 'during', workTime, 's. Protocol:', urlParams.protocol);

bombard();

