/* 
  Title : Token Handler
  Description : Handler to handle all Token based request
  Author : Aritra Pal
  Date : 21/11/2022 
*/

//dependencies
const data = require("../../lib/data");
const utils = require("../../helpers/utilities");

//module Scaffolding
const handler = {};

//Sample handler
handler.tokenHandler = (RequestProperties, callback) => {
  //array of valid request
  const acceptedRequest = ["post", "get", "put", "delete"];

  //Give valid output if valid request else error
  if (acceptedRequest.indexOf(RequestProperties.method) >= 0) {
    //send the request and call back to another funtion handling user operations
    handler._token[RequestProperties.method](RequestProperties, callback);
  } else {
    //Invalid request throw Status code 405 and empty object
    callback(405);
  }
};

//another scaffolding inside handler for users operation
handler._token = {};

//for Post operations
handler._token.post = (RequestProperties, callback) => {
  //phone and password validation
  const phone =
    typeof RequestProperties.body.phone === "string"
      ? RequestProperties.body.phone
      : false;

  const password =
    typeof RequestProperties.body.password === "string" &&
    RequestProperties.body.password.trim().length > 0 &&
    RequestProperties.body.password.trim().length < 30
      ? RequestProperties.body.password
      : false;
  if (phone && password) {
    //read from db
    data.read("users", phone, (err, userData) => {
      // if not error then proceed else no record with phone no. given
      if (!err) {
        //check if given password is correct
        const hashedPassword = utils.hash(password);
        if (hashedPassword === utils.parseJSON(userData).password) {
          //create token
          const tokenId = utils.randomString(20);
          const tokenExp = Date.now() + 60 * 60 * 1000;
          const tokenObj = {
            phone,
            id: tokenId,
            tokenExp,
          };
          //save tken in db
          data.create("token", tokenId, tokenObj, (err) => {
            //if not error procceed else server problem
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, {
                message: "Internal Server Error Please try after some time",
              });
            }
          });
        } else {
          callback(400, { message: "Invalid Password!" });
        }
      } else {
        callback(400, { message: "No record with that phone no." });
      }
    });
  } else {
    callback(400, { message: "Invalid request" });
  }
};
//for Get operations
handler._token.get = (RequestProperties, callback) => {
  //getting user data using token id
  const tokenId = RequestProperties.headers.token;
  if (tokenId) {
    data.read("token", tokenId, (err, result) => {
      let tokenObj = { ...utils.parseJSON(result) };
      if (!err && result) {
        //if found then show the data to user
        callback(200, tokenObj);
      } else {
        //if not found throw error to user
        callback(400, { message: "No record found with this token id" });
      }
    });
  } else {
    //if there is no phone property in RequestProperties then give invalid error
    callback(400, { message: "invalid" });
  }
};

//for Put operations
handler._token.put = (RequestProperties, callback) => {
  //getting user data using token id
  const tokenId = RequestProperties.body.id;
  const extend =
    typeof RequestProperties.body.extend === "boolean"
      ? RequestProperties.body.extend
      : false;
  if (tokenId && extend) {
    //if token property is present in RequestProperties then read from filebase
    data.read("token", tokenId, (err, result) => {
      if (!err) {
        let tokenObj = { ...utils.parseJSON(result) };
        if (tokenObj.tokenExp > Date.now()) {
          const oldExpTime = tokenObj.tokenExp;
          const newExpTime = Date.now() + 60 * 60 * 1000;
          tokenObj.tokenExp = newExpTime;
          //now update into filebase
          data.update("token", tokenId, tokenObj, (err) => {
            //show new exp time to user
            const extdTime = Math.abs(
              new Date(Date.now()) - new Date(newExpTime)
            );
            if (!err) {
              callback(200, {
                message: "time extended successfully",
                TokenValidUpto: newExpTime,
              });
            } else {
              callback(500, { message: "Internal server Error" });
            }
          });
        } else {
          callback(400, { message: "already expired" });
        }
      } else {
        callback(400, { message: "Tokenid invalid" });
      }
    });
  } else {
    //if there is no id and extend property in RequestProperties then give invalid error
    callback(400, { message: "invalid" });
  }
};

//for Delete operations
handler._token.delete = (RequestProperties, callback) => {
  //deleting user data using phone number
  const tokenId = RequestProperties.headers.token;
  if (tokenId) {
    //if phone property is present in RequestProperties then read from filebase
    data.read("token", tokenId, (err) => {
      if (!err) {
        //if found then delete the user
        data.delete("token", tokenId, (res) => {
          callback(200, { message: "token " + res });
        });
      } else {
        //if not found throw error to user
        callback(400, { message: "Invalid token id" });
      }
    });
  } else {
    //if there is no phone property in RequestProperties then give invalid error
    callback(400, { message: "invalid" });
  }
};

//for token verification
handler._token.verify = (id, phone, callback) => {
  //read token file
  data.read("token", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        utils.parseJSON(tokenData).phone == phone &&
        utils.parseJSON(tokenData).tokenExp > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;
