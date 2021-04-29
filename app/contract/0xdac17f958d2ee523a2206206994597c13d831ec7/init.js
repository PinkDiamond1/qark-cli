const ora = require('ora');
const ethers = require('ethers');

module.exports = async (wallet, contract) => {
    
    // LOAD TOTAL USDT BALANCE
    spinner = ora('Loading total USDT balance').start();
    const balance = await contract.balanceOf(wallet.address);
    spinner.succeed('Total USDT balance : ' + removeTrailingZero(balance) + ' USDT');

    // IF NO BALANCE, RETURN TRUE
    if(balance.toString() === '0'){
        spinner.stop();
        return true;
    }
}

function removeTrailingZero(input){
    input = ethers.utils.formatEther(input);
    if(input.slice(-2) === '.0'){
        return input.replace('.0', '');
    }
    return input;
}

async function isFreezeActive(frozenTiming){
    return parseInt(frozenTiming.toString()) > Math.floor(+ new Date() / 1000);
}
