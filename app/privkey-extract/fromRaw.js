const ethers = require('ethers');

module.exports = privKey => {
    privKey = privKey.trim();
    return new Promise(resolve => {
        if(privKey.length === 64){
            privKey = '0x' + privKey;
        }
        resolve((new ethers.Wallet(privKey)))
    });
}
