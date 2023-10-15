const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

const argv = yargs(hideBin(process.argv))
    .options({
        a: {
            alias: 'address',
            demandOption: true,
            default: 'http://localhost',
            describe: 'url to query',
            type: 'string'
        },
        m: {
            alias: 'mode',
            demandOption: true,
            default: 'http',
            describe: 'requests mode (http or tcp)',
            type: 'string'
        },
        p: {
            alias: 'port',
            describe: 'port number, gets overrided by the port specified in url.',
            type: 'number'
        },
        r: {
            alias: 'timeout',
            describe: 'requests timeout before request is destroyed',
            type: 'number',
            default: 60,
        },
        t: {
            alias: 'time',
            demandOption: true,
            default: 10,
            describe: 'time in seconds to send requests',
            type: 'number'
        },
        c: {
            alias: 'concurrent',
            demandOption: true,
            default: 1000,
            describe: 'number of concurrent requests',
            type: 'number'
        }
    })
    .help()
    .argv

module.exports = argv;