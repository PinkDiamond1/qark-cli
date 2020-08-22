const inquirer = require('inquirer');
const ABI = require('../contract/ABI');

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
            .then((answers) => {
                console.log(answers);
            });
    });
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
