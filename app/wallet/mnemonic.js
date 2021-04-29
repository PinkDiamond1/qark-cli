const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: async () => {
        const answer = await inquirer.prompt([{
                type: 'input',
                name: 'mnemonic',
                message: 'Enter Mnemonic phrase:',
                validate: function(input){
                    if(ethers.Wallet.fromMnemonic(input)){
                        return true;
                    }
                    return false;
                }
            }
        ]);
        if(answer && answer.mnemonic){
            const privKey = await chooseAddress(answer.mnemonic.trim())
            return privKey;
        }
    },

    parse: input => {
        return new ethers.Wallet(input);
    }
}

async function chooseAddress(mnemonic) {
    const wallets = {};
    let wallet;
    for(let i = 0; i < 10; i++){
        wallet = ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
        wallets[wallet.address] = wallet.privateKey;
    }
    const choice = await inquirer.prompt([{
        type: 'list',
        name: 'wallet',
        message: 'Choose wallet:',
        choices: Object.keys(wallets)
    }]);
    return wallets[choice.wallet];
}
