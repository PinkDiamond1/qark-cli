const getAccessType = require('./inquiries/getAccessType');

const getUtcPath = require('./inquiries/getUtcPath');
const extractFromUtc = require('./privkeyExtract/fromUtc');

const getMnemonic = require('./inquiries/getMnemonic');
const extractFromMnemonic = require('./privkeyExtract/fromMnemonic');

const getRaw = require('./inquiries/getRaw');
const extractFromRaw = require('./privkeyExtract/fromRaw');

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
    console.log(wallet);
}

main();
