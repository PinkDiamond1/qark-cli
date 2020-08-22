const getAccessType = require('./inquiries/getAccessType');

const getUtcPath = require('./inquiries/getUtcPath');
const extractFromUtc = require('./privkeyExtract/fromUtc');

const getMnemonic = require('./inquiries/getMnemonic');
const extractFromMnemonic = require('./privkeyExtract/fromMnemonic');

const getRaw = require('./inquiries/getRaw');
const extractFromRaw = require('./privkeyExtract/fromRaw');

const initContract = require('./contract/init');
const contractAddress = '0x63120ccd7b415743e8753AfD167F5AD4A1732C43';
const rpcEndpoint = 'https://mainnet.infura.io/v3/690402f68fae43b6a8637913a50b2831';

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
        default:
            break;
    }
    const contract = initContract(contractAddress, wallet, rpcEndpoint);
    startMenu(contract);
}

main();
