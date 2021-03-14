const ethers = require('ethers');
const walletAccess = require('./wallet-access');

const chooseContract = require('./contracts');
const rpcEndpoint = 'https://mainnet.infura.io/v3/690402f68fae43b6a8637913a50b2831';

const startMenu = require('./menu/start');

(async function (){
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const wallet = await walletAccess(provider);
    const contract = await chooseContract(wallet);
    startMenu(contract.instance, contract.ABI);
})()
