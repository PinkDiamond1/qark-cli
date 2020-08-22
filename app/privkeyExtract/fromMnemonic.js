const ethers = require('ethers');

module.exports = mnemonic => {
    mnemonic = mnemonic.trim();
    return new Promise(resolve => {
        resolve(ethers.Wallet.fromMnemonic(mnemonic))
    });
}
