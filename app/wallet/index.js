const inquirer = require('inquirer');
const ethers = require('ethers');
const ora = require('ora');
const fs = require('fs').promises;

const address = require('./address');
const mnemonic = require('./mnemonic');
const privkey = require('./privkey');
const seed = require('./seed');
const utcfile = require('./utcfile');

// AVAILABLE WALLET ACCESS OPTIONS
const accessMap = {
    'UTC keystore file': utcfile,
    'Mnemonic phrase': mnemonic,
    'Raw HEX private key': privkey,
    'Seed phrase [DANGEROUS]': seed,
    'Wallet address [READ-ONLY]' : address
};

module.exports = async provider => {

    // LET THE USER CHOOSE A WALLET ACCESS OPTION
    const answer = await inquirer.prompt([{
            type: 'list',
            name: 'access',
            message: 'Choose wallet access:',
            choices: Object.keys(accessMap),
        }
    ]);

    // LOAD WALLET ACCESSOR METHOD
    const accessor = getAccessor(answer);
    if (accessor) {

        // REQUEST INPUT FROM USER TO ACCESS WALLET
        const input = await accessor.request();

        // PARSE INPUT AND CONNECT INITIALISED WALLET TO SUPPLIED PROVIDER
        const wallet = (await accessor.parse(input)).connect(provider);

        // EXPORT WALLET IF NEEDED
        await exportWallet(wallet);

        // PRINT WALLET INFORMATION
        await printWalletInfo(wallet);

        // RETURN INITIALISED WALLET
        return wallet;
    }

    // THE CHOSEN ACCESSOR DOES NOT PROVIDE request() AND parse() METHODS
    throw new Error("Invalid wallet accessor method!");
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

async function exportWallet(wallet, retry){
    if(process.argv.includes('--export')){
        if(retry !== true){
            wallet = await encryptWallet(wallet);
        }
        const answer = await inquirer.prompt([{
            type: 'input',
            name: 'exportFolder',
            message: 'Type export folder path:'
        }]);
        const spinner = ora('Exporting wallet...').start();
        if(answer?.exportFolder){
            try{
                const exportPath = `${answer.exportFolder}/${getExportFilename(wallet)}`;
                await fs.writeFile(exportPath, wallet);
                await new Promise(resolve => setTimeout(resolve, 1000));
                spinner.succeed(`Exported to: ${exportPath}`);
            }catch(e){
                spinner.fail(e.message);
                return await exportWallet(wallet, true);
            }
        }
    }
}

async function encryptWallet(wallet){
    const answer = await inquirer.prompt([{
        type: 'password',
        name: 'exportPassword',
        message: 'Type export password:'
    }]);
    const spinner = ora('Encrypting wallet...').start();
    const json = await wallet.encrypt(answer.exportPassword);
    spinner.succeed()
    return json;
}

function getExportFilename(json){
    const date = (new Date()).toJSON();
    return `UTC--${date}--${JSON.parse(json).address.toLowerCase()}`;
}

async function printWalletInfo(wallet){
    process.stdout.write('\n');
    let spinner = ora('Determining wallet address...').start();
    await new Promise(resolve => setTimeout(resolve, 500));
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
