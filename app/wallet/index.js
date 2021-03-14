const inquirer = require('inquirer');
const ethers = require('ethers');
const ora = require('ora');

const address = require('./address');
const mnemonic = require('./mnemonic');
const privkey = require('./privkey');
const seed = require('./seed');
const utcfile = require('./utcfile');

const accessMap = {
    'UTC keystore file': utcfile,
    'Mnemonic phrase': mnemonic,
    'Raw HEX private key': privkey,
    'Seed phrase [DANGEROUS]': seed,
    'Wallet address [READ-ONLY]' : address
};

module.exports = provider => {

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'access',
                    message: 'Choose wallet access:',
                    choices: Object.keys(accessMap),
                }
            ])
            .then(async answers => {
                const accessor = getAccessor(answers);
                if (accessor) {
                    const input = await accessor.request();
                    const wallet = (await accessor.parse(input)).connect(provider);

                    // PRINT WALLET INFORMATION
                    await printWalletInfo(wallet);

                    // RESOLVE WITH WALLET
                    resolve(wallet);
                }
                reject();
            });
    });
}

function getAccessor(answers){
    if(answers && answers.access && accessMap[answers.access]){
        if(typeof accessMap[answers.access].request === 'function'){
            if(typeof accessMap[answers.access].parse === 'function'){
                return accessMap[answers.access];
            }
        }
    }
    return false;
}

async function printWalletInfo(wallet){
    process.stdout.write('\n');
    let spinner = ora('Determining wallet address...').start();
    await timeout(500);
    spinner.succeed(`Wallet address     : ${wallet.address}`);

    spinner = ora('Loading avail. ETH balance').start();
    const ethBalance = await wallet.getBalance();
    spinner.succeed('Avail. ETH balance : ' + removeTrailingZero(ethBalance) + ' ETH');
    process.stdout.write('\n');
}

function removeTrailingZero(input){
    input = ethers.utils.formatEther(input);
    if(input.slice(-2) === '.0'){
        return input.replace('.0', '');
    }
    return input;
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
