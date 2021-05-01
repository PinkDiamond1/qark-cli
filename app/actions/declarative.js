const fs = require('fs');
const yaml = require('yaml');
const ethers = require('ethers');
const path = require('path');
const inquirer = require('inquirer');

module.exports = {
    
    detect: () => {

        // LOOP THROUGH ALL CLI ARGUMENTS
        for(const i in process.argv){
            const arg = process.argv[i];

            // IF EITHER -action OR --action IS DEFINED IN AN ARGUMENT
            if(arg.includes('-action')){
                
                // PARSE DEFINITION FORMAT '='
                if(arg.includes('=')){
                    const manifestPath = arg.split('=')[1];
                    return yaml.parse(fs.readFileSync(manifestPath).toString());
                }
            }
        }
        return false;
    },
    
    execute: async (wallet, action) => {
        if((await confirm(action))){
            if(action.params && action.params.length){
                console.log(action.params);
                action.params = expandZeroesForUint(action.params);
                console.log(action.params);
            }
            const ABI = await getContractAbi(action.to);
            if(ABI){
                const contract = new ethers.Contract(action.to, ABI, wallet);
                return await contractCall(action, contract);
            }
            return await tx(action);
        }
    }
}

async function getContractAbi(contractAddress) {
    const abiPath = path.dirname(__dirname) + `/contract/${contractAddress}/ABI.json`;
    if (fs.existsSync(abiPath)) {
        return require(abiPath);
    }
    return false;
}

async function tx(action){
    
}

async function contractCall(action, contract){
    try{
        const result = await contract[action.method].apply(null, action.params);
        console.log(result);
    }catch(e){
        console.error(e);
    }
}

async function confirm(action){
    console.log('========== CONFIRM TRANSACTION ==========')
    console.log(action);
    console.log('========== =================== ==========');
    const confirmed = await inquirer.prompt([{
        type: 'confirm',
        name: 'check',
        message: 'Do you want to execute above transaction?',
        default: false,
    }]);
    return confirmed && confirmed.check === true;
}

function expandZeroesForUint(params){
    for(const i in params){
        const param = params[i];
        if(typeof param === 'string' && param.includes('z')){
            const numbers = param.split('z');
            if(parseInt(numbers[0]) == numbers[0]){
                params[i] = numbers[0] + '0'.repeat(numbers[1]);
            }
        }
    }
    return params;
}
