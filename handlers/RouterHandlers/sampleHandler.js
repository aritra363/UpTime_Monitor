/* 
  Title : Sample Handler
  Description : Sample Route Handler
  Author : Aritra Pal
  Date : 14/11/2022 
*/

//dependencies

//module Scaffolding
const handler = {};

//Sample handler
handler.sampleHandler = (RequestProperties, callback) => {
  callback(200, {
    message: "This is a Restful API",
    method: RequestProperties.method,
    pathname: RequestProperties.path,
  });
};

module.exports = handler;
