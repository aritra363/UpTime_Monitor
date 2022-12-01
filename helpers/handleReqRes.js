/* 
  Title : Handle Request & Response
  Description : Handle Request & Response
  Author : Aritra Pal
  Date : 14/11/2022 
*/

//Dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const router = require("../Routes");
const {
  notFoundHandler,
} = require("../handlers/RouterHandlers/notFoundHandler");
const { parseJSON } = require("./utilities");

//module scaffholding
const handler = {};

// handling Request
handler.handleReqRes = (req, res) => {
  //Request handling
  const parsedUrl = url.parse(req.url, true);
  const method = req.method.toLowerCase();
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
  const query = parsedUrl.query;
  const headers = req.headers;

  //Properties object to send to chosenHandler
  const RequestProperties = {
    parsedUrl,
    method,
    path,
    query,
    headers,
  };

  //handler based on routing
  const chosenHandler = router[path] ? router[path] : notFoundHandler;

  //Decoding Body or Payload which is utf-8 encoded
  //create an object of StringDecoder Class
  const Decoder = new StringDecoder("utf-8");
  let body = "";

  //on getting data decode it with Decoder
  req.on("data", (buffer) => {
    body += Decoder.write(buffer);
  });
  //on end of getting data end Decoding and print it
  req.on("end", () => {
    Decoder.end();

    //send body(POST DATA ) to RequestProperties
    RequestProperties.body = parseJSON(body);

    //using chosenHandler to get status code and payload
    chosenHandler(RequestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      payload = typeof payload === "object" ? payload : {};

      //Converting payload object to string
      const payloadString = JSON.stringify(payload);

      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, PUT, GET, DELETE,OPTIONS",
        "Access-Control-Allow-Headers":
          "Origin, X-Api-Key, X-Requested-With, Content-Type, Accept, token",
        "Access-Control-Allow-Credentials": true,
      });
      res.write(payloadString);
      res.end();
      //res.write("\n" + body); //for post data
    });
  });
};

module.exports = handler;
