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
            return answer.mnemonic;
        }
    },

    parse: input => {
        return ethers.Wallet.fromMnemonic(input.trim())
    }
}
