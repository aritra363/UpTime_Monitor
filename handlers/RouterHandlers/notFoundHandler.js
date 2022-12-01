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
handler.notFoundHandler = (RequestProperties, callback) => {
  callback(404, {
    message: "Not Found",
    method: RequestProperties.method,
    pathname: RequestProperties.path,
  });
};

module.exports = handler;
