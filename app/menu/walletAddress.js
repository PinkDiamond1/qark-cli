const ora = require('ora');

module.exports = wallet => {
    const spinner = ora('Determining wallet address...').start();
    return new Promise(resolve => {
        setTimeout(function () {
            spinner.succeed(`Wallet address     : ${wallet.address}`);
            resolve();
        }, 1000);
    });
}
