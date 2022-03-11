const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

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

module.exports = argv;