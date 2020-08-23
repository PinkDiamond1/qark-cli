const ora = require('ora');
const ethers = require('ethers');

module.exports = (wallet, contract) => {
    return new Promise(async resolve => {

        let spinner = ora('Loading ETH balance').start();
        const ethBalance = await wallet.getBalance();
        spinner.succeed('Avail. ETH balance : ' + removeTrailingZero(ethers.utils.formatEther(ethBalance)) + ' ETH');

        spinner = ora('Loading QARK balance').start();
        const qarkBalance = await contract.balanceOf(wallet.address);
        spinner.succeed('Avail. QARK balance: ' + removeTrailingZero(ethers.utils.formatEther(qarkBalance)) + ' QARK');

        spinner = ora('Loading locked QARK balance').start();
        const lockedQarkBalance = await contract.lockedBalanceOf(wallet.address);
        spinner.succeed('Locked QARK balance: ' + removeTrailingZero(ethers.utils.formatEther(lockedQarkBalance)) + ' QARK');

        spinner = ora('Loading frozen QARK balance').start();
        const frozenQarkBalance = await contract.frozenBalanceOf(wallet.address);
        spinner.succeed('Frozen QARK balance: ' + removeTrailingZero(ethers.utils.formatEther(frozenQarkBalance)) + ' QARK');

        resolve();
    });
}

function removeTrailingZero(input){
    if(input.slice(-2) === '.0'){
        return input.replace('.0', '');
    }
    return input;
}
