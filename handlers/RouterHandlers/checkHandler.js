/* 
  Title : Check Handler
  Description : Handler to handle all userdefined checks
  Author : Aritra Pal
  Date : 23/11/2022 
*/

//dependencies
const data = require("../../lib/data");
const utils = require("../../helpers/utilities");
const tokenhandler = require("./tokenHandler");
const environment = require("../../helpers/environments");

//module Scaffolding
const handler = {};

//Sample handler
handler.checkHandler = (RequestProperties, callback) => {
  //array of valid request
  const acceptedRequest = ["post", "get", "put", "delete"];

  //Give valid output if valid request else error
  if (acceptedRequest.indexOf(RequestProperties.method) >= 0) {
    //send the request and call back to another funtion handling user operations
    handler._check[RequestProperties.method](RequestProperties, callback);
  } else {
    //Invalid request throw Status code 405 and empty object
    callback(405);
  }
};

//another scaffolding inside handler for check operation
handler._check = {};

//for Post operations
handler._check.post = (RequestProperties, callback) => {
  //validate input
  let protocol =
    typeof RequestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(RequestProperties.body.protocol) > -1
      ? RequestProperties.body.protocol
      : false;

  let method =
    typeof RequestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(
      RequestProperties.body.method.toLowerCase()
    ) > -1
      ? RequestProperties.body.method
      : false;

  let url =
    typeof RequestProperties.body.url === "string" &&
    RequestProperties.body.url.trim().length > 0
      ? RequestProperties.body.url
      : false;

  let successcode =
    typeof RequestProperties.body.successcode === "object" &&
    RequestProperties.body.successcode instanceof Array
      ? RequestProperties.body.successcode
      : false;

  let timeout =
    typeof RequestProperties.body.timeout === "number" &&
    RequestProperties.body.timeout % 1 === 0 &&
    RequestProperties.body.timeout >= 1 &&
    RequestProperties.body.timeout <= 5
      ? RequestProperties.body.timeout
      : false;

  if (protocol && url && method && successcode && timeout) {
    //Authentication Process starts
    let token =
      typeof RequestProperties.headers.token === "string"
        ? RequestProperties.headers.token
        : false;

    //read from filebase using token
    data.read("token", token, (err, tokenData) => {
      if (!err && tokenData) {
        let phone = utils.parseJSON(tokenData).phone;
        //read from filebase using phone number
        data.read("users", phone, (err, userData) => {
          if (!err && userData) {
            //verify the token
            tokenhandler._token.verify(token, phone, (tokenIsValid) => {
              if (tokenIsValid) {
                //all authentication successful
                let userObj = utils.parseJSON(userData);
                let userChecks =
                  typeof userObj.checks === "object" &&
                  userObj.checks instanceof Array
                    ? userObj.checks
                    : [];

                //validate if user has reached limit of checks
                if (userChecks.length < environment.maxChecks) {
                  //create a checkid
                  const checkId = utils.randomString(20);
                  const checkObj = {
                    id: checkId,
                    phone,
                    protocol,
                    method,
                    url,
                    successcode,
                    timeout,
                  };
                  //save check data in filebase
                  data.create("checks", checkId, checkObj, (err) => {
                    if (!err) {
                      //put checkid in userobj and then update user file base
                      userObj.checks = userChecks;
                      userObj.checks.push(checkId);
                      //save to filebase
                      data.update("users", phone, userObj, (err) => {
                        if (!err) {
                          callback(200, {
                            message: "Checks Saved Successfully",
                            checkObj,
                          });
                        } else {
                          callback(500, { message: "Server Error" });
                        }
                      });
                    } else {
                      callback(500, { message: "Server Side Error!" });
                    }
                  });
                } else {
                  callback(401, {
                    message: `Reached Maximum Limit of Checks(${environment.maxChecks} ,Can't create more!)`,
                  });
                }
              } else {
                callback(403, { message: "Authentication Problem!" });
              }
            });
          } else {
            callback(403, { message: "Authentication Problem!" });
          }
        });
      } else {
        callback(403, { message: "Authentication Problem!" });
      }
    });
  } else {
    callback(400, { message: "Invalid Request" });
  }
};
//for Get operations
handler._check.get = (RequestProperties, callback) => {
  const checkId =
    typeof RequestProperties.query.id === "string"
      ? RequestProperties.query.id
      : false;
  if (checkId) {
    data.read("checks", checkId, (err, checkData) => {
      if (!err && checkData) {
        const phone = utils.parseJSON(checkData).phone;
        const tokenId =
          typeof RequestProperties.headers.token === "string"
            ? RequestProperties.headers.token
            : false;
        tokenhandler._token.verify(tokenId, phone, (tokenIsValid) => {
          if (tokenIsValid) {
            callback(200, utils.parseJSON(checkData));
            console.log(checkData);
          } else {
            callback(403, { message: "Authentication Problem" });
          }
        });
      } else {
        callback(400, { message: "Invalid CheckID" });
      }
    });
  } else {
    callback(400, { message: "Invalid Request" });
  }
};

//for Put operations
handler._check.put = (RequestProperties, callback) => {
  //validate input
  let protocol =
    typeof RequestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(RequestProperties.body.protocol) > -1
      ? RequestProperties.body.protocol
      : false;

  let method =
    typeof RequestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(
      RequestProperties.body.method.toLowerCase()
    ) > -1
      ? RequestProperties.body.method
      : false;

  let url =
    typeof RequestProperties.body.url === "string" &&
    RequestProperties.body.url.trim().length > 0
      ? RequestProperties.body.url
      : false;

  let successcode =
    typeof RequestProperties.body.successcode === "object" &&
    RequestProperties.body.successcode instanceof Array
      ? RequestProperties.body.successcode
      : false;

  let timeout =
    typeof RequestProperties.body.timeout === "number" &&
    RequestProperties.body.timeout % 1 === 0 &&
    RequestProperties.body.timeout >= 1 &&
    RequestProperties.body.timeout <= 5
      ? RequestProperties.body.timeout
      : false;

  if (protocol || url || method || successcode || timeout) {
    //Authentication Process starts
    const checkId =
      typeof RequestProperties.query.id === "string"
        ? RequestProperties.query.id
        : false;
    if (checkId) {
      data.read("checks", checkId, (err, userCheckData) => {
        if (!err && userCheckData) {
          let checkData = utils.parseJSON(userCheckData);
          const phone = checkData.phone;
          const tokenId =
            typeof RequestProperties.headers.token === "string"
              ? RequestProperties.headers.token
              : false;
          tokenhandler._token.verify(tokenId, phone, (tokenIsValid) => {
            if (tokenIsValid) {
              //put value in checkObject
              if (protocol) checkData.protocol = protocol;
              if (method) checkData.method = method;
              if (url) checkData.url = url;
              if (timeout) checkData.timeout = timeout;
              if (successcode) checkData.successcode = successcode;

              data.update("checks", checkId, checkData, (err) => {
                if (!err) {
                  callback(200, {
                    message: "successfully updated",
                    updatedcheck: checkData,
                  });
                } else {
                  callback(500, { message: "Server Error" });
                }
              });
            } else {
              callback(403, { message: "Authentication Problem" });
            }
          });
        } else {
          callback(400, { message: "Invalid CheckID" });
        }
      });
    } else {
      callback(400, { message: "Error in checkid input" });
    }
  } else {
    callback(400, { message: "Nothing to update or wrong Input" });
  }
};

//for Delete operations
handler._check.delete = (RequestProperties, callback) => {
  const checkId =
    typeof RequestProperties.query.id === "string"
      ? RequestProperties.query.id
      : false;
  if (checkId) {
    data.read("checks", checkId, (err, checkData) => {
      if (!err && checkData) {
        const phone = utils.parseJSON(checkData).phone;
        const tokenId =
          typeof RequestProperties.headers.token === "string"
            ? RequestProperties.headers.token
            : false;
        tokenhandler._token.verify(tokenId, phone, (tokenIsValid) => {
          if (tokenIsValid) {
            data.delete("checks", checkId, (result) => {
              if (result == "Deleted successfully") {
                //read user object
                data.read("users", phone, (err, userData) => {
                  if (!err && userData) {
                    //delete the checkid from user object
                    let uData = utils.parseJSON(userData);
                    uData.checks.splice(uData.checks.indexOf(checkId), 1);
                    //update the userdata
                    data.update("users", phone, uData, (err) => {
                      if (!err) {
                        callback(200, { message: "Deleted Successfully" });
                      } else {
                        callback(500, {
                          message: "Server Error in updating userdata",
                        });
                      }
                    });
                  } else {
                    callback(500, {
                      message: "Server Error in reading userdata",
                    });
                  }
                });
              } else {
                callback(500, {
                  message: "Server Error in deleting check file",
                });
              }
            });
          } else {
            callback(403, { message: "Authentication Problem" });
          }
        });
      } else {
        callback(400, { message: "Invalid CheckID" });
      }
    });
  } else {
    callback(400, { message: "Invalid Request" });
  }
};

module.exports = handler;
