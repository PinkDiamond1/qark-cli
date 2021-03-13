const ora = require('ora');
const ethers = require('ethers');

module.exports = (wallet, contract) => {
    return new Promise(async resolve => {

        process.stdout.write('\n');
        let spinner = ora('Determining wallet address...').start();
        await timeout(1000);
        spinner.succeed(`Wallet address     : ${wallet.address}`);

        spinner = ora('Loading avail. ETH balance').start();
        const ethBalance = await wallet.getBalance();
        spinner.succeed('Avail. ETH balance : ' + removeTrailingZero(ethBalance) + ' ETH');

        // STOP HERE IF THIS IS NOT THE QARK ERC20 CONTRACT
        if(contract.address !== '0x63120ccd7b415743e8753AfD167F5AD4A1732C43'){
            return resolve();
        }

        spinner = ora('Loading total QARK balance').start();
        const qarkBalance = await contract.balanceOf(wallet.address);
        spinner.succeed('Total QARK balance : ' + removeTrailingZero(qarkBalance) + ' QARK');

        if(qarkBalance.toString() === '0'){
            spinner.stop();
            return resolve();
        }

        spinner = ora('Checking frozen QARK balance').start();
        const frozenQarkBalance = await contract.frozenBalanceOf(wallet.address);

        if(frozenQarkBalance.toString() === '0'){
            spinner.stop();
            return resolve();
        }

        const frozenTiming = await contract.frozenTimingOf(wallet.address);

        if(!isFreezeActive(frozenTiming)){
            spinner.stop();
            return resolve();
        }

        spinner.text = 'Loading avail. QARK balance';
        setTimeout(function () {
            spinner.succeed('Avail. QARK balance: ' + removeTrailingZero(qarkBalance.sub(frozenQarkBalance).toString()) + ' QARK');
            spinner.succeed(
                'Frozen QARK balance: ' + removeTrailingZero(frozenQarkBalance.toString()) + ' QARK ' +
                '(until ' + new Date(parseInt(frozenTiming.toString() + '000'))
                    .toISOString()
                    .replace('.000Z','')
                    .replace('T', ' ') + ' GMT' + ')'
            );
            spinner.stop();
            resolve();
        }, 1000);
    });
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

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
