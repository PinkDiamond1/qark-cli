// LOAD MAIN MODULES
const selectProvider = require('./provider');
const selectWallet = require('./wallet');
const selectContract = require('./contract');

const imperativeAction = require('./actions/imperative');
const declarativeAction = require('./actions/declarative');

(async function (){
    const provider = await selectProvider();
    const wallet = await selectWallet(provider);
    const dAction = await declarativeAction.detect();
    if(dAction){
        return await declarativeAction.execute(wallet, dAction);
    }
    const contract = await selectContract(wallet);
    imperativeAction(contract.instance, contract.ABI);
})()
