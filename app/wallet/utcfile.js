const inquirer = require('inquirer');
const ethers = require('ethers');
const fs = require('fs');
const ora = require('ora');

module.exports = {
    request: () => {
        return new Promise((resolve, reject) => {
            inquirer
                .prompt([{
                        type: 'input',
                        name: 'path',
                        message: 'Enter UTC keystore file path:'
                    }
                ])
                .then((answers) => {
                    if(answers && answers.path){
                        resolve(answers.path)
                    }
                    reject();
                });
        });
    },

    parse: input => {
        utcPath = input.trim();
        return new Promise((resolve, reject) => {
            fs.access(utcPath, fs.F_OK, (err) => {
                if (err) {
                    console.error(`UTC file not accessible at ${utcPath}!`);
                    process.exit();
                }
                fs.readFile(utcPath, async (err, data) => {
                    if (err){
                        return reject(err);
                    }
                    const wallet = await decryptWallet(data.toString());
                    resolve(wallet);
                });
            });
        });
    }
}

async function decryptWallet(json){
    const answers = await inquirer.prompt([{
            type: 'password',
            name: 'pass',
            message: 'Enter UTC keystore file password:'
        }
    ]);
    const spinner = ora('Unlocking UTC keystore...').start();
    try {
        const decrypted = await ethers.Wallet.fromEncryptedJson(json, answers.pass);
        spinner.succeed('Unlocked UTC keystore!');
        return decrypted;
    } catch (e) {
        spinner.fail('Wrong password for UTC keystore!');
        return decryptWallet(json);
    }
}
