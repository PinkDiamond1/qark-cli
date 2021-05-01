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
    input = ethers.utils.formatUnits(input, 6);
    if(input.slice(-2) === '.0'){
        input = input.replace('.0', '');
    }
    return input.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
