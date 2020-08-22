const inquirer = require('inquirer');

module.exports = () => {
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
}
