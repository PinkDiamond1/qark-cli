// LOAD MAIN MODULES
const selectProvider = require('./provider');
const selectWallet = require('./wallet');
const selectContract = require('./contract');

const startMenu = require('./menu/start');

(async function (){
    const provider = await selectProvider();
    const wallet = await selectWallet(provider);
    const contract = await selectContract(wallet);
    startMenu(contract.instance, contract.ABI);
})()
