const benchmarkPromise = (func, ...args) => new Promise(resolve => {
    const start = Date.now();
    const end = data => resolve({ data, time: Date.now() - start });
    func(...args).then(end, end);
})

module.exports = {benchmarkPromise};

