const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    
    request: async () => {
        const answer = await inquirer.prompt([{
            type: 'password',
            name: 'seed',
            message: 'Enter seed phrase [DANGEROUS]:',
            validate: function(input) {
                if(input.length < 8){
                    return 'Type at least 8 characters!';
                }
                return true;
            }
        }]);
        if (answer && answer.seed) {
            return answer.seed;
        }
    },

    parse: input => {
        seed = input.trim();
        return new ethers.Wallet(ethers.utils.keccak256(ethers.utils.toUtf8Bytes(seed)));
    }
}
