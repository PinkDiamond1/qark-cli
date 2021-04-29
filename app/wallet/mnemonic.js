const inquirer = require('inquirer');
const ethers = require('ethers');
const fs = require('fs');

module.exports = {

    detect: () => {

        // LOOP THROUGH ALL CLI ARGUMENTS
        for(const i in process.argv){
            const arg = process.argv[i];

            // IF EITHER -mnemo[nic] OR --mnemo[nic] IS DEFINED IN AN ARGUMENT
            if(arg.includes('-mnemo')){
                
                // PARSE DEFINITION FORMAT '='
                if(arg.includes('=')){
                    const mnemoPath = arg.split('=')[1];
                    return fs.readFileSync(mnemoPath).toString().trim();
                }
            }
        }
        return false;
    },

    request: async () => {
        
        // TRY TO AUTO DETECT CLI SUPPLIED MNEMONIC PATH
        const detected = module.exports.detect();
        if(detected){
            return detected;
        }

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
            return answer.mnemonic;
        }
    },

    parse: async input => {
        const privKey = await chooseAddress(input.trim())
        return new ethers.Wallet(privKey);
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
