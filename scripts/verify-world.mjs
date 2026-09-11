import {lookupAgentRegistration} from '../src/agentbook.js';
const address=process.argv[2];
if(!address){console.error('Usage: node scripts/verify-world.mjs <public-agent-address>');process.exitCode=1;}
else {try{console.log(JSON.stringify(await lookupAgentRegistration(address),null,2));}catch(error){console.error(error.code||error.message);process.exitCode=1;}}
