const ora = require('ora');

module.exports = wallet => {
    process.stdout.write('\n');
    const spinner = ora('Determining wallet address...').start();
    return new Promise(resolve => {
        setTimeout(function () {
            spinner.succeed(`Wallet address     : ${wallet.address}`);
            resolve();
        }, 1000);
    });
}
