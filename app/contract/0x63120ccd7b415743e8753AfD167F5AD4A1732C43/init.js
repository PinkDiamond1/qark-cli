const ora = require('ora');
const ethers = require('ethers');

module.exports = async (wallet, contract) => {
    
    // LOAD TOTAL QARK BALANCE
    spinner = ora('Loading total QARK balance').start();
    const qarkBalance = await contract.balanceOf(wallet.address);
    spinner.succeed('Total QARK balance : ' + removeTrailingZero(qarkBalance) + ' QARK');

    // IF NO BALANCE, RETURN TRUE
    if(qarkBalance.toString() === '0'){
        spinner.stop();
        return true;
    }

    // IF THERE IS A BALANCE, CHECK IF PART OF IT IS FROZEN
    spinner = ora('Checking frozen QARK balance').start();
    const frozenQarkBalance = await contract.frozenBalanceOf(wallet.address);

    // IF NO FROZEN AMOUNT, RETURN TRUE
    if(frozenQarkBalance.toString() === '0'){
        spinner.stop();
        return true;
    }

    // IF THERE IS FROZEN BALANCE, BUT THE TIMING PASSED, ALSO RETURN TRUE
    const frozenTiming = await contract.frozenTimingOf(wallet.address);
    if(!isFreezeActive(frozenTiming)){
        spinner.stop();
        return true;
    }

    // IF TIMING ACTIVE, DETERMINE AVAILABLE AND FROZEN BALANCE, THEN RETURN
    spinner.text = 'Loading avail. QARK balance';
    await new Promise(resolve => setTimeout(resolve, 1000));
    spinner.succeed('Avail. QARK balance: ' + removeTrailingZero(qarkBalance.sub(frozenQarkBalance).toString()) + ' QARK');
    spinner.succeed(
        'Frozen QARK balance: ' + removeTrailingZero(frozenQarkBalance.toString()) + ' QARK ' +
        '(until ' + new Date(parseInt(frozenTiming.toString() + '000'))
            .toISOString()
            .replace('.000Z','')
            .replace('T', ' ') + ' GMT' + ')'
    );
    spinner.stop();
    return true;
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
