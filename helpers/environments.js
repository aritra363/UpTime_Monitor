/* 
  Title : Environments variable
  Description : Handle all environments thing
  Author : Aritra Pal
  Date : 15/11/2022 
*/
//dependencies

//module scaffolding
const environments = {};

//For Staging
environments.staging = {
  port: 3000,
  envname: "staging",
  secretKey: "staging@1234",
  maxChecks: 5,
  twilio: {
    from: "+18145594758",
    accountSid: "ACb7137234c9bf911af791b101e9cf9f4d",
    authToken: "a9a2ba46dd2028cb17db019bdbca1a5c",
  },
};

//For Production
environments.production = {
  port: 5000,
  envname: "production",
  secretKey: "production@1234",
  maxChecks: 5,
  twilio: {
    from: "+18145594758",
    accountSid: "ACb7137234c9bf911af791b101e9cf9f4d",
    authToken: "a9a2ba46dd2028cb17db019bdbca1a5c",
  },
};

//getting the current environment
const currentEnvironment =
  typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "staging";

//checking which environment to export
const environmentToExport =
  typeof environments[currentEnvironment] === "object"
    ? environments[currentEnvironment]
    : environments.staging;

//exporting
module.exports = environmentToExport;
