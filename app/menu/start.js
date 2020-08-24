const inquirer = require('inquirer');
const ABI = require('../contract/ABI');
const ora = require('ora');

module.exports = contract => {
    const functions = parseFunctions();
    const choices = [];
    for (fnc in functions) {
        choices.push(functions[fnc].display)
    }
    return new Promise((resolve, reject) => {
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
                                    name: input.name,
                                    message: `Please enter "${input.name}" (${input.type}):`
                                });
                            });
                            params = await inquirer.prompt(questions);
                        }
                        const spinner = ora('Calling ' + getCalledMethodText(functionName, params)).start();
                        try {
                            const result = await contract[functionName].apply(null, Object.values(params));
                            spinner.succeed('Called  ' + getCalledMethodText(functionName, params, result));
                        } catch (e) {
                            spinner.fail(e.message);
                        }
                        setTimeout(async () => {
                            await module.exports(contract);
                        }, 1500);
                    }
                }
            });
    });
}

function getCalledMethodText(functionName, params, result){
    if(!result){
        return `${functionName}(` + Object.values(params).join(', ') + ')';
    }
    const output = result.hash ? result.hash : result.toString();
    return `${functionName}(` + Object.values(params).join(', ') + ') = ' + output;
}

function parseFunctions(){
    const functions = {};
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
    //console.log(functions);
    //console.log(JSON.stringify(functions, null, 4));
    return functions;
}
