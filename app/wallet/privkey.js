const inquirer = require('inquirer');
const ethers = require('ethers');

module.exports = {
    request: async () => {
        const answer = await inquirer.prompt([{
            type: 'password',
            mask: '*',
            name: 'privkey',
            message: 'Enter raw HEX private key:',
            validate: function(input) {
                if(input.length !== 64 && input.length !== 66){
                    return '64 HEX chars optionally prefixed with 0x required!';
                }
                input = input.replace('0x', '');
                if (input.length === 64) {
                    const re = /[0-9A-Fa-f]{64}/g;
                    if (re.test(input)) {
                        return true;
                    }
                    return 'Not a HEX string!'
                }
                return 'Unknown error'
            }
        }]);
        if (answer && answer.privkey) {
            return answer.privkey;
        }
    },

    parse: input => {
        privKey = input.trim();
        if(privKey.length === 64){
            privKey = '0x' + privKey;
        }
        return new ethers.Wallet(privKey);
    }
}
