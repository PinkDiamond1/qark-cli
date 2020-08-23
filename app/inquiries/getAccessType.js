const inquirer = require('inquirer');

module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'access',
                    message: 'Choose wallet access:',
                    choices: [
                        'UTC keystore file',
                        'Mnemonic phrase',
                        'Raw HEX private key',
                        'Seed phrase [DANGEROUS]'
                    ],
                }
            ])
            .then((answers) => {
                if(answers && answers.access){
                    switch (answers.access) {
                        case 'UTC keystore file':
                            return resolve('UTC');
                        case 'Mnemonic phrase':
                            return resolve('MNEMONIC');
                        case 'Raw HEX private key':
                            return resolve('RAW');
                        case 'Seed phrase [DANGEROUS]':
                            return resolve('SEED');
                        default:

                    }
                }
                reject();
            });
    });
}
