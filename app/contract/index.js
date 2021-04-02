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

async function initContract(contractAddress, contractAbi, walletAddress, walletProvider) {

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

async function chooseContract(wallet){

    // LOAD PREDEFINED CONTRACTS
    const contracts = getContracts();

    // ADD OPTION TO CHOOSE CUSTOM CONTRACT
    contracts['Enter custom address...'] = null;
    
    // PROMPT USER TO CHOOSE CONTRACT ADDRESS
    const answer = await inquirer.prompt([{
        type: 'list',
        name: 'contract',
        message: 'Choose contract:',
        choices: Object.keys(contracts)
    }]);

    // IF A CONTRACT WAS CHOSEN
    if(answer && answer.contract){

        // INIT EMPTY CONTRACT OBJECT
        let contract = {};

        // CHOSEN CONTRACT WAS FOUND LOCALLY
        if(contracts[answer.contract]){
            contract = {
                address: answer.contract,
                ABI: await contracts[answer.contract]
            }
        }

        // LET USER CHOOSE CUSTOM CONTRACT ADDRESS
        if(answer.contract === 'Enter custom address...'){
            contract = await getCustomContract();
        }

        // IF ADDRESS AND ABI DEFINED
        if(contract.address && contract.ABI){
            
            // ATTACH CONTRACT INSTANCE AND RETURN OBJECT 
            contract.instance = new ethers.Contract(contract.address, contract.ABI, wallet);
            return contract;
        }
    }
    throw new Error("No contract chosen!");
}

async function getCustomContract(){
    const answer = await inquirer.prompt([{
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
    }]);
    if (answer && answer.address) {
        const ABI = await getContractAbi(answer.address, true);
        return {
            address: answer.address,
            ABI: ABI
        };
    }
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
