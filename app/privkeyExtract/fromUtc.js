const ethers = require('ethers');
const fs = require('fs');
const inquirer = require('inquirer');

module.exports = utcPath => {
    utcPath = utcPath.trim();
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

async function decryptWallet(json){
    const answers = await inquirer.prompt([{
            type: 'password',
            name: 'pass',
            message: 'Enter UTC keystore file password:'
        }
    ]);
    try {
        return await ethers.Wallet.fromEncryptedJson(json, answers.pass);
    } catch (e) {
        return decryptWallet(json);
    }
}
