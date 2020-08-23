const ethers = require('ethers');

module.exports = seed => {
    seed = seed.trim();
    return new Promise(resolve => {
        resolve((new ethers.Wallet(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed)))));
    });
}
