const inquirer = require('inquirer');
const ora = require('ora');
const ethers = require('ethers');

module.exports = (contract, ABI) => {
    const functions = parseFunctions(ABI);
    const choices = [];
    for (fnc in functions) {
        choices.push(functions[fnc].display)
    }
    return new Promise((resolve, reject) => {
        process.stdout.write('\n');
        inquirer
            .prompt([{
                    type: 'list',
                    name: 'fnc',
                    message: 'Choose function:',
                    choices: choices
                }
            ])
            .then(async answer => {
                if(answer && answer.fnc){
                    const functionName = answer.fnc.split('(')[0];
                    if(functions[functionName]){
                        let params = [];
                        if(functions[functionName].inputs && functions[functionName].inputs.length){
                            const questions = [];
                            functions[functionName].inputs.forEach((input, i) => {
                                questions.push({
                                    type: 'input',
                                    name: input.name ? input.name : input.type,
                                    message: input.name ? `Please enter "${input.name}" (${input.type}):` : `Please enter "${input.type}":`
                                });
                            });
                            params = await inquirer.prompt(questions);
                            params = patchUintType(params, functions[functionName].inputs);
                        }
                        const spinner = ora('Calling ' + getCalledMethodText(functionName, params)).start();
                        try {
                            const callApplyParams = Object.values(params);
                            if(functionName === 'freezeOwnTokens'){
                                callApplyParams.push({gasLimit: 172000});
                            }
                            const result = await callContract(contract, functionName, callApplyParams);
                            spinner.succeed('Called  ' + getCalledMethodText(functionName, params, result));
                        } catch (e) {
                            spinner.fail(e.message);
                        }
                        setTimeout(async () => {
                            await module.exports(contract, ABI);
                        }, 1500);
                    }
                }
            });
    });
}

async function callContract(contract, functionName, params){
    if(functionName === '_ETH_TX'){
        return contract.signer.sendTransaction({
            to: params[0],
            value: ethers.utils.parseEther(ethers.utils.formatEther(params[1])),
            gasLimit: 21000,
            gasPrice: await contract.provider.getGasPrice(),
            nonce: await contract.signer.getTransactionCount()
        });
    }
    if(functionName === '_ETH_SWEEP'){
        const code = await contract.provider.getCode(params[0]);
        if (code !== '0x') {
            throw new Error('Cannot sweep to a contract!');
        }
        const balance = await contract.signer.getBalance();
        const gasLimit = 21000;
        const gasPrice = await contract.provider.getGasPrice();
        return contract.signer.sendTransaction({
            to: params[0],
            value: balance.sub(gasPrice.mul(gasLimit)),
            gasLimit: gasLimit,
            gasPrice: gasPrice,
            nonce: await contract.signer.getTransactionCount()
        });
    }
    return contract[functionName].apply(null, params);
}

function patchUintType(params, inputs){
    inputs.forEach(input => {
        if(input.name && input.type && input.type.includes('uint')){
            if(params[input.name] && params[input.name].includes('z')){
                const numbers = params[input.name].split('z');
                params[input.name] = numbers[0] + '0'.repeat(numbers[1]);
            }
            if(params[input.name] && params[input.name].includes('unix::')){
                const dateToTimestamp = params[input.name].split('unix::');
                params[input.name] = Math.floor((new Date(dateToTimestamp[1].trim() + ' UTC')).getTime() / 1000);
            }
        }
    });
    return params;
}

function getCalledMethodText(functionName, params, result){
    if(!result){
        return `${functionName}(` + Object.values(params).join(', ') + ')';
    }
    let output = result.hash ? result.hash : result.toString();
    if(typeof output === 'string' && output.includes('000000000000000000')){
        output += ' (' + output.replace('000000000000000000', '') + ' * 10^18)';
    }
    return `${functionName}(` + Object.values(params).join(', ') + ') = ' + output;
}

function parseFunctions(ABI){
    const functions = {
        _ETH_TX: {
            display: '_ETH_TX(to, amount)',
            inputs: [
                {
                    name: 'to',
                    type: 'address'
                },
                {
                    name: 'amount',
                    type: 'uint256'
                }
            ]
        },
        _ETH_SWEEP: {
            display: '_ETH_SWEEP(to)',
            inputs: [
                {
                    name: 'to',
                    type: 'address'
                }
            ]
        }
    };
    ABI.forEach((item, i) => {
        if(item && item.name && item.type && item.type === 'function'){
            functions[item.name] = {
                display: item.name + '(',
                inputs: []
            }
            if(item.inputs && typeof item.inputs.forEach === 'function'){
                item.inputs.forEach((input, j) => {
                    functions[item.name].display += input.name;
                    if(item.inputs[j + 1]){
                        functions[item.name].display += ', ';
                    }
                    functions[item.name].inputs.push({
                        name: input.name,
                        type: input.type
                    })
                });
                functions[item.name].display += ')';
            }
        }
    });
    return functions;
}
