const inquirer = require('inquirer');

const address = require('./address');
const mnemonic = require('./mnemonic');
const privkey = require('./privkey');
const seed = require('./seed');
const utcfile = require('./utcfile');

const accessMap = {
    'UTC keystore file': utcfile,
    'Mnemonic phrase': mnemonic,
    'Raw HEX private key': privkey,
    'Seed phrase [DANGEROUS]': seed,
    'Wallet address [READ-ONLY]' : address
};

module.exports = () => {

    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'access',
                    message: 'Choose wallet access:',
                    choices: Object.keys(accessMap),
                }
            ])
            .then(async answers => {
                const accessor = getAccessor(answers);
                if (accessor) {
                    const input = await accessor.request();
                    return resolve(await accessor.parse(input))
                }
                reject();
            });
    });
}

function getAccessor(answers){
    if(answers && answers.access && accessMap[answers.access]){
        if(typeof accessMap[answers.access].request === 'function'){
            if(typeof accessMap[answers.access].parse === 'function'){
                return accessMap[answers.access];
            }
        }
    }
    return false;
}
