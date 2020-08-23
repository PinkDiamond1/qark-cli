const inquirer = require('inquirer');

module.exports = () => {
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                type: 'password',
                name: 'seed',
                message: 'Enter seed phrase [DANGEROUS]:',
                validate: function(input) {
                    if(input.length < 8){
                        return 'Type at least 8 characters!';
                    }
                    return true;
                }
            }])
            .then((answers) => {
                if (answers && answers.seed) {
                    resolve(answers.seed)
                }
                reject();
            });
    });
}
