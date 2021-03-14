const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: () => {
        return new Promise((resolve, reject) => {
            inquirer
                .prompt([{
                    type: 'input',
                    name: 'address',
                    message: 'Enter wallet address [READ-ONLY]:',
                    validate: function(input) {
    
                        // CHECK ADDRESS LENGTH (WITH / WITHOUT 0x PREFIX)
                        if(input.length !== 40 && input.length !== 42){
                            return 'Wrong address length!';
                        }
                        return true;
                    }
                }])
                .then((answers) => {
                    if (answers && answers.address) {
                        resolve(answers.address)
                    }
                    reject();
                });
        });
    },

    parse: input => {
        return new Promise(resolve => {
            resolve(new ethers.VoidSigner(input));
        });
    }
}
