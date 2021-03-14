const fs = require('fs');
const ethers = require('ethers');
const inquirer = require('inquirer');

module.exports = async wallet => {

    // LET THE USER PICK THE DESIRED CONTRACT
    const contract = await chooseContract(wallet);

    // INIT CONTRACT
    await initContract(contract.address, contract.ABI, wallet.address, wallet.provider);

    // RETURN CONTRACT INSTANCE
    return contract;
}

function initContract(contractAddress, contractAbi, walletAddress, walletProvider) {
    return new Promise(async resolve => {

        // DEFINE CONTRACT INIT PATH
        const initPath = __dirname + `/${contractAddress}/init.js`;

        // IF THERE IS AN INIT SCRIPT
        if (fs.existsSync(initPath)) {

            // LOAD IT
            const init = require(initPath);

            // CREATE READ ONLY VERSIONS OF WALLET AND CONTRACT
            const roWallet = (new ethers.VoidSigner(walletAddress)).connect(walletProvider);
            const roContract = new ethers.Contract(contractAddress, contractAbi, roWallet);

            // CALL INIT SCRIPT
            await init(roWallet, roContract);
        }

        // THERE WAS NO INIT FILE FOR CONTRACT, RESOLVE IMMEDIATELY
        resolve();
    });
}

async function getContractAbi(contractAddress, fetchFromEtherscan) {
    const abiPath = __dirname + `/${contractAddress}/ABI.json`;
    if (fs.existsSync(abiPath)) {
        return require(abiPath);
    }
    if (fetchFromEtherscan){
        return await ethers.utils.fetchJson(
            `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}`,
            null,
            responseToABI
        );
    }
    return false;
}

function responseToABI(response){
    if(response && response.status && parseInt(response.status) === 1){
        try{
            return JSON.parse(response.result);
        }catch(e){}
    }
    return false;
}

function chooseContract(wallet){
    const contracts = getContracts();
    contracts['Enter custom address...'] = null;
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'contract',
                    message: 'Choose contract:',
                    choices: Object.keys(contracts)
                }
            ])
            .then(async answers => {
                if(answers && answers.contract){

                    let contract;

                    // CHOSEN CONTRACT WAS FOUND LOCALLY
                    if(contracts[answers.contract]){
                        contract = {
                            address: answers.contract,
                            ABI: await contracts[answers.contract]
                        }
                    }

                    // LET USER CHOOSE CUSTOM CONTRACT ADDRESS
                    if(answers.contract === 'Enter custom address...'){
                        contract = await getCustomContract();
                    }

                    // REJECT IF BOTH ADDRESS AND ABI COULD NOT BE DEFINED
                    if(!contract.address || !contract.ABI){
                        reject();
                    }
                    
                    // ATTACH CONTRACT INSTANCE
                    contract.instance = new ethers.Contract(contract.address, contract.ABI, wallet);
                    return resolve(contract);
                }
                reject();
            });
    });
}

function getCustomContract(){
    return new Promise(resolve => {
        inquirer
        .prompt([{
            type: 'input',
            name: 'address',
            message: 'Enter contract address:',
            validate: function(input) {

                // CHECK ADDRESS LENGTH (WITH / WITHOUT 0x PREFIX)
                if(input.length !== 40 && input.length !== 42){
                    return 'Wrong address length!';
                }
                return true;
            }
        }])
        .then(async answers => {
            if (answers && answers.address) {
                const ABI = await getContractAbi(answers.address, true);
                return resolve({
                    address: answers.address,
                    ABI: ABI
                });
            }
            reject();
        });
    });
}

function getContracts(){

    // INIT EMPTY ARRAY FOR VALID CONTRACT ADDRESSES
    const contracts = {};

    // SCAN CONTRACTS DIRECTORY LOOKING FOLDERS WITH CONTRACT ADDRESS NAME
    fs.readdirSync(__dirname).forEach(fileName => {

        // IF FILENAME LENGTH IS ADDRESS LENGTH
        if(fileName.length === 42) {

            // TRY TO GET CONTRACT ABI
            const ABI = getContractAbi(fileName)

            // CHECK WITH ETHERS UTILS TO ENSURE IT IS VALID ADDRESS AND HAS AN ABI
            if(ethers.utils.isAddress(fileName) && ABI){
                contracts[fileName] = ABI;
            }
        }
    });

    // RETURN POPULATED CONTRACT ADDRESSES
    return contracts;
}
