const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = () => {
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
                    resolve(answers.mnemonic)
                }
                reject();
            });
    });
}
