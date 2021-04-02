const rpc = require('./rpc');

module.exports = async () => {
    rpc.detect();
    return rpc.init();
}
