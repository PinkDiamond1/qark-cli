const fs = require('fs');
const ethers = require('ethers');
const inquirer = require('inquirer');

module.exports = async wallet => {

    // LET THE USER PICK THE DESIRED CONTRACT
    const contract = await chooseContract();    

    // INIT CONTRACT
    await initContract(contract.address, contract.ABI, wallet.address, wallet.provider);

    // RETURN NEW CONTRACT INSTANCE
    return new ethers.Contract(contract.address, contract.ABI, wallet);
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

function getContractAbi(contractAddress) {
    const abiPath = __dirname + `/${contractAddress}/ABI.json`;
    if (fs.existsSync(abiPath)) {
        return require(abiPath);
    }
    return false;
}

function chooseContract(){
    const contracts = getContracts();
    return new Promise((resolve, reject) => {
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'contract',
                    message: 'Choose contract:',
                    choices: Object.keys(contracts)
                }
            ])
            .then((answers) => {
                if(answers && answers.contract){
                    resolve({
                        address: answers.contract,
                        ABI: contracts[answers.contract]
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
