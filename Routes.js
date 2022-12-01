/* 
  Title : Routes Handler
  Description : Routes Handler
  Author : Aritra Pal
  Date : 14/11/2022 
*/

//dependencies
const { sampleHandler } = require("./handlers/RouterHandlers/sampleHandler");
const { userHandler } = require("./handlers/RouterHandlers/userHandler");
const { tokenHandler } = require("./handlers/RouterHandlers/tokenHandler");
const { checkHandler } = require("./handlers/RouterHandlers/checkHandler");

// Route to Handler Function mapping
const router = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = router;
