const fs = require('fs');
const yaml = require('yaml');
const ethers = require('ethers');
const path = require('path');
const inquirer = require('inquirer');
const ora = require('ora');

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
                    const manifestContent = fs.readFileSync(manifestPath).toString();
                    const patchedYaml = patchHexAddressInYaml(manifestContent);
                    return yaml.parseAllDocuments(patchedYaml);
                }
            }
        }
        return false;
    },
    
    execute: async (wallet, actions) => {
        const defaultWallet = wallet;
        if(!actions.length){
            actions = [actions];
        }
        for(const i in actions){
            wallet = defaultWallet;
            action = yaml.parse(actions[i].toString());
            if(action.from && action.from !== wallet.address){
                wallet = await findWallet(action.from, defaultWallet.provider);
                if(wallet === false){
                    console.error(`${action.from} wallet was not found!`);
                    continue;
                }
            }
            if((await confirm(action))){
                if(action.params && action.params.length){
                    action.params = expandZeroesForUint(action.params);
                }
                const ABI = await getContractAbi(action.to);
                if(ABI){
                    const contract = new ethers.Contract(action.to, ABI, wallet);
                    await contractCall(action, contract);
                    continue;
                }
                await tx(action, wallet);
            }
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

async function tx(action, wallet){
    action.value = expandZeroesSingle(action.value);
    const msg = `TRANSFER ${wallet.address} => ${action.to} :: ${action.value} WEI`;
    const spinner = ora(msg).start();
    try{
        const result = await wallet.sendTransaction(action);
        if(result && result.wait){
            await result.wait();
        }
        spinner.succeed(`${msg} = ${result.hash}`);
    }catch(e){
        spinner.fail(e.message);
    }
    const result = wallet.sendTransaction(wallet.sendTransaction(tx));
}

async function contractCall(action, contract){
    if(!action.params){
        action.params = [];
    }
    const spinner = ora(`${contract.address} :: ${action.method}(${action.params.join(', ')})`).start();
    try{
        const result = await contract[action.method].apply(null, action.params);
        if(result && result.wait){
            await result.wait();
        }
        let output = result.hash ? result.hash : result.toString();
        if(typeof output === 'string' && output.includes('000000000000000000')){
            output += ' (' + output.replace('000000000000000000', '') + ' * 10^18)';
        }
        spinner.succeed(`${contract.address} :: ${action.method}(${action.params.join(', ')}) = ${output}`);
    }catch(e){
        spinner.fail(e.message);
    }
}

function patchHexAddressInYaml(txtContent){
    const matches = txtContent.match(/0x[0-9A-Fa-f]{40}/g);
    const replaced = {};
    matches.forEach(match => {
        if(!replaced[match]){
            txtContent = txtContent.replaceAll(match, `'${match}'`);
            replaced[match] = true;
        }
    });
    return txtContent;
}

async function confirm(action){
    console.log("\n" + '========== CONFIRM TRANSACTION ==========')
    console.log(action);
    console.log('========== =================== ==========' + "\n");
    const confirmed = await inquirer.prompt([{
        type: 'confirm',
        name: 'check',
        message: 'Do you want to execute above transaction?',
        default: false,
    }]);
    return confirmed && confirmed.check === true;
}

function expandZeroesSingle(param){
    if(typeof param === 'string' && param.includes('z')){
        const numbers = param.split('z');
        if(parseInt(numbers[0]) == numbers[0]){
            return numbers[0] + '0'.repeat(numbers[1]);
        }
    }
    return param;
}

function expandZeroesForUint(params){
    for(const i in params){
        params[i] = expandZeroesSingle(params[i]);
    }
    return params;
}

async function findWallet(address, provider){
    const spinner = ora(`Finding wallet ${address}...`).start();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mnemonic = getMnemonic();
    if(mnemonic === false){
        spinner.fail("Mnemonic not supplied!");
    }
    let wallet;
    for(let i = 0; i < 100; i++){
        const derivPath = `m/44'/60'/0'/0/${i}`;
        wallet = ethers.Wallet.fromMnemonic(mnemonic, derivPath);
        if(wallet.address === address){
            spinner.succeed();
            return wallet.connect(provider);
        }
    }
    spinner.fail(`Wallet ${address} not found!`);
    return false;
}

function getMnemonic(){
    // LOOP THROUGH ALL CLI ARGUMENTS
    for(const i in process.argv){
        const arg = process.argv[i];

        // IF EITHER -mnemo[nic] OR --mnemo[nic] IS DEFINED IN AN ARGUMENT
        if(arg.includes('-mnemo')){
            
            // PARSE DEFINITION FORMAT '='
            if(arg.includes('=')){
                const mnemoPath = arg.split('=')[1];
                return fs.readFileSync(mnemoPath).toString().trim();
            }
        }
    }
    return false;
}
