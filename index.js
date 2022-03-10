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
            default: 'http://localhost/huy',
            describe: 'url to query',
            type: 'string'
        },
        p: {
            alias: 'port',
            demandOption: true,
            default: '80',
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
let port = argv.p;
const concurrent = argv.c;
const workTime = argv.t;

const urlParams = url.parse(address);
if(address.port) port = address.port;


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
        const promise = benchmarkPromise(makeRequest, options, 0, false);
        set.add(promise);
        promise.then(({data}) => {
            const {status} = data;
            const key = status || data.code;
            statuses[key] = statuses[key] ? statuses[key] += 1 : 1;
            set.delete(promise);
            if ((Date.now() - start) / 1000 < workTime) return bombard();
            if (set.size === 0) end();
        });
        if (set.size < concurrent) bombard();
    } catch (e) {
        console.log('request sent:', counter);
        console.log(e);
    }
}

function end() {
    console.log('\nended');
    console.log(statuses);
}

console.log('Starting to test', urlParams.hostname, 'on port', port, 'during', workTime, 's');

bombard();

