const rpc = require('./rpc');
const ethers = require('ethers');

const providers = [
    rpc
];

module.exports = async () => {
    for(const i in providers){
        const provider = providers[i];
        if(provider.detect()){
            return provider.init();
        }
    }
    return new ethers.getDefaultProvider();
}
