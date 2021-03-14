const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: () => {
        return new Promise((resolve, reject) => {
            inquirer
                .prompt([{
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
                ])
                .then((answers) => {
                    if(answers && answers.mnemonic){
                        return resolve(answers.mnemonic)
                    }
                    reject();
                });
        });
    },

    parse: input => {
        return new Promise(resolve => {
            resolve(ethers.Wallet.fromMnemonic(input.trim()));
        });
    }
}
