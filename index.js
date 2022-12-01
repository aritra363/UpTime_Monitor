/* 
  Title : UpTime Monitor System
  Description : An API that tells user if a given link is up or down
  Author : Aritra Pal
  Date : 10/11/2022 
*/

// Dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");

// app object - Module Scaffolding
const app = {};

//start the server and workers
app.init = () => {
  //start server
  server.init();

  //start the workers
  workers.init();
};

//call the init function
app.init();
