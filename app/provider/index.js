const rpc = require('./rpc');

module.exports = () => {
    return new Promise(resolve => {
        rpc.detect();
        resolve(rpc.init())
    });
}
