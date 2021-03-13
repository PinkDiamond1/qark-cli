const fs = require('fs');
const ethers = require('ethers');
const inquirer = require('inquirer');

module.exports = async wallet => {

    // LET THE USER PICK THE DESIRED CONTRACT ADDRESS
    const contractAddress = await chooseContractAddress();

    // INIT NEW CONTRACT INSTANCE WITH IT'S ABI
    return new ethers.Contract(contractAddress, require(__dirname + `/${contractAddress}.json`), wallet);    
}

function chooseContractAddress(){
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'contract',
                    message: 'Choose contract:',
                    choices: getContractAddresses()
                }
            ])
            .then((answers) => {
                if(answers && answers.contract){
                    resolve(answers.contract)
                }
                reject();
            });
    });
}

function getContractAddresses(){

    // INIT EMPTY ARRAY FOR VALID CONTRACT ADDRESSES
    const contracts = [];

    // SCAN CONTRACTS DIRECTORY LOOKING FOR ABI FILES
    fs.readdirSync(__dirname).forEach(fileName => {

        // IF FILENAME LENGTH IS ADDRESS LENGTH + .JSON EXTENSION
        if(fileName.length === 42 + 5) {

            // AND HAS ACTUAL JSON EXTENSION
            if(fileName.substr(-5).toLowerCase() === '.json'){
                const contractAddress = fileName.substr(0, 42)

                // CHECK WITH ETHERS UTILS TO ENSURE IT IS VALID ADDRESS
                if(ethers.utils.isAddress(contractAddress)){
                    contracts.push(contractAddress);
                }
            }
        }
    });

    // RETURN POPULATED CONTRACT ADDRESSES
    return contracts;
}
