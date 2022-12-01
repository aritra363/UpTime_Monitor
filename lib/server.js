/* 
  Title : Server Handling file
  Description : handles server related activities
  Author : Aritra Pal
  Date : 10/11/2022 
*/

// Dependencies
const http = require("http");
const { handleReqRes } = require("../helpers/handleReqRes");
const environment = require("../helpers/environments");

// server object - Module Scaffolding
const server = {};

// create a server
server.createServer = () => {
  const serverVariable = http.createServer(server.handleRequest);
  serverVariable.listen(environment.port, () => {
    console.log(`Listening on Port ${environment.port}`);
  });
};
server.handleRequest = handleReqRes;

server.init = () => {
  server.createServer();
};

//export the module
module.exports = server;
