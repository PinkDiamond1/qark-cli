const ethers = require('ethers');
const ABI = require('./ABI');

module.exports = (contractAddress, wallet, rpcEndpoint) => {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    return new ethers.Contract(contractAddress, ABI, wallet.connect(provider));
}
