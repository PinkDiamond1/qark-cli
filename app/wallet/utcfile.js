const inquirer = require('inquirer');
const ethers = require('ethers');
const { promises: fs } = require("fs");
const ora = require('ora');

module.exports = {
    request: async () => {
        const answer = await inquirer.prompt([{
                type: 'input',
                name: 'path',
                message: 'Enter UTC keystore file path:'
            }
        ]);
        if(answer && answer.path){
            return answer.path;
        }
    },

    parse: async input => {
        utcPath = input.trim();
        try{
            await fs.access(utcPath, fs.F_OK);
            const data = await fs.readFile(utcPath);
            return await decryptWallet(data.toString());
        }catch(e){
            throw new Error(e);
        }
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
