const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: () => {
        return new Promise((resolve, reject) => {
            inquirer
                .prompt([{
                    type: 'password',
                    name: 'seed',
                    message: 'Enter seed phrase [DANGEROUS]:',
                    validate: function(input) {
                        if(input.length < 8){
                            return 'Type at least 8 characters!';
                        }
                        return true;
                    }
                }])
                .then((answers) => {
                    if (answers && answers.seed) {
                        resolve(answers.seed)
                    }
                    reject();
                });
        });
    },

    parse: input => {
        seed = input.trim();
        return new Promise(resolve => {
            resolve((new ethers.Wallet(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed)))));
        });
    }
}
