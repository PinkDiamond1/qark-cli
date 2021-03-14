const ethers = require('ethers');

// INDICATES WHETHER AN RPC PROVIDER COULD BE DETECTED
let detected = false;

// AFTER SUCCESSFUL DETECTION, PROVIDER WILL BE INITIALIZED IN THIS VARIABLE
let endpoint = null;

module.exports = {

    // CHECKS CLI ARGS AND ENV VARS TO DETECT AN RPC ENDPOINT DEFINED
    detect: () => {

        // DETECT ENDPOINT IN CLI ARGS
        detectCliArgs();

        // DETECT ENDPOINT IN ENV VAR
        detectEnvVar();

        // THIS VALUE WILL BE SET BY DETECTORS ON SUCCESS
        return detected;
    },

    init: () => {
        return new ethers.providers.JsonRpcProvider(endpoint);
    }
}

function detectEnvVar(){

    // IF THE RPC ENV VAR IS SET
    if (process.env.RPC) {

        // DETECTION SUCCESSFUL
        detected = true;

        // SET ENDPOINT
        endpoint = process.env.RPC;
    }
}

function detectCliArgs(){

     // LOOP THROUGH ALL CLI ARGUMENTS
     process.argv.forEach((arg, i) => {

        // IF EITHER -rpc OR --rpc IS DEFINED IN AN ARGUMENT
        if(arg.includes('-rpc')){
            
            // DETECTED RPC ENDPOINT DEFINITION
            detected = true;
            
            // PARSE DEFINITION FORMAT '='
            if(arg.includes('=')){
                endpoint = arg.split('=')[1];
                return;
            }

            // PARSE NEXT ARG FORMAT
            endpoint = process.argv[i + 1];
            return;
        }
    });
}
