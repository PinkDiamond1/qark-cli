const ethers = require('ethers');
const ABI = require('./ABI');

module.exports = (contractAddress, wallet) => {
    return new ethers.Contract(contractAddress, ABI, wallet);
}
