const ethers = require('ethers');
const getAccessType = require('./wallet-access/getAccessType');

const getUtcPath = require('./wallet-access/getUtcPath');
const extractFromUtc = require('./privkey-extract/fromUtc');

const getMnemonic = require('./wallet-access/getMnemonic');
const extractFromMnemonic = require('./privkey-extract/fromMnemonic');

const getRaw = require('./wallet-access/getRaw');
const extractFromRaw = require('./privkey-extract/fromRaw');

const getSeed = require('./wallet-access/getSeed');
const extractFromSeed = require('./privkey-extract/fromSeed');

const initContract = require('./contract/init');
const contractAddress = '0x63120ccd7b415743e8753AfD167F5AD4A1732C43';
const rpcEndpoint = 'https://mainnet.infura.io/v3/690402f68fae43b6a8637913a50b2831';

const getInfo = require('./menu/info');
const startMenu = require('./menu/start');

async function main(){
    const accessType = await getAccessType();
    let wallet;
    switch (accessType) {
        case 'UTC':
            const utcPath = await getUtcPath();
            wallet = await extractFromUtc(utcPath);
            break;
        case 'MNEMONIC':
            const mnemonic = await getMnemonic();
            wallet = await extractFromMnemonic(mnemonic);
            break;
        case 'RAW':
            const raw = await getRaw();
            wallet = await extractFromRaw(raw);
            break;
        case 'SEED':
            const seed = await getSeed();
            wallet = await extractFromSeed(seed);
            break;
        default:
            break;
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    wallet = wallet.connect(provider);
    const contract = initContract(contractAddress, wallet, rpcEndpoint);
    await getInfo(wallet, contract);
    startMenu(contract);
}

main();
