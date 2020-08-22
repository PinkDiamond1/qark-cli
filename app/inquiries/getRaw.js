const inquirer = require('inquirer');

module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'input',
                name: 'privkey',
                message: 'Enter raw HEX private key:',
                validate: function(input) {
                    if(input.length !== 64 && input.length !== 66){
                        return '64 HEX chars optionally prefixed with 0x required!';
                    }
                    const testable = input.replace('0x', '');
                    if (testable.length === 64) {
                        const re = /[0-9A-Fa-f]{64}/g;
                        if (re.test(testable)) {
                            return true;
                        }
                        return 'Not a HEX string!'
                    }
                    return 'Unknown error'
                }
            }])
            .then((answers) => {
                if (answers && answers.privkey) {
                    resolve(answers.privkey)
                }
                reject();
            });
    });
}
