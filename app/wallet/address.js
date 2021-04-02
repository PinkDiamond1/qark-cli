const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: async () => {
        const answer = await inquirer.prompt([{
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
        }]);
        if (answer && answer.address) {
            return answer.address;
        }
    },

    parse: input => {
        return new ethers.VoidSigner(input.trim());
    }
}
