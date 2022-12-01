/* 
  Title : User Handler
  Description : Handler to handle all user based request
  Author : Aritra Pal
  Date : 17/11/2022 
*/

//dependencies
const data = require("../../lib/data");
const utils = require("../../helpers/utilities");
const tokenhandler = require("./tokenHandler");

//module Scaffolding
const handler = {};

//Sample handler
handler.userHandler = (RequestProperties, callback) => {
  //array of valid request
  const acceptedRequest = ["post", "get", "put", "delete"];

  //Give valid output if valid request else error
  if (acceptedRequest.indexOf(RequestProperties.method) >= 0) {
    //send the request and call back to another funtion handling user operations
    handler._users[RequestProperties.method](RequestProperties, callback);
  } else {
    //Invalid request throw Status code 405 and empty object
    callback(405);
  }
};

//another scaffolding inside handler for users operation
handler._users = {};

//for Post operations
handler._users.post = (RequestProperties, callback) => {
  //Validation of the fields
  const firstName =
    typeof RequestProperties.body.firstName === "string" &&
    RequestProperties.body.firstName.trim().length > 0 &&
    RequestProperties.body.firstName.trim().length < 20
      ? RequestProperties.body.firstName
      : false;

  const lastName =
    typeof RequestProperties.body.lastName === "string" &&
    RequestProperties.body.lastName.trim().length > 0 &&
    RequestProperties.body.lastName.trim().length < 20
      ? RequestProperties.body.lastName
      : false;
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
  const tosAgreement =
    typeof RequestProperties.body.tosAgreement === "boolean" /* &&
    RequestProperties.body.tosAgreement.trim().length > 0 */
      ? RequestProperties.body.tosAgreement
      : false;

  //if all the variable is true then we will add
  if (firstName && lastName && phone && password && tosAgreement) {
    //if all fields are true the Proceed to save user data

    //Before saving user check if the user already exist
    data.read("users", phone, (err, result) => {
      //if error comes then the file doesnt exist so we will insert
      if (err) {
        //insert the user data
        //making an object of the user's credentials
        let userObj = {
          firstName,
          lastName,
          phone,
          password: utils.hash(password),
          tosAgreement,
          checks: [],
        };
        //userObj = JSON.stringify(userObj);
        data.create("users", phone, userObj, (err) => {
          if (!err) {
            //successfully inserted new user
            callback(200, { message: "User added Successfully" });
          } else {
            //user insertion unsuccessful
            callback(500, {
              message: "Internal Server Error,Please try after some time",
            });
          }
        });
      } else {
        //File already exists So retur a message
        callback(500, { message: "User already exist with same Phone number" });
      }
    });
  } else {
    /* console.log(
      RequestProperties.body,
      firstName,
      lastName,
      phone,
      password,
      tosAgreement
    ); */
    callback(400, {
      message:
        "Invalid Input , Please check the documentation for creating user",
    });
  }
};
//for Get operations
handler._users.get = (RequestProperties, callback) => {
  //getting user data using phone number
  const phone = RequestProperties.query.phone;
  const tokenId =
    typeof RequestProperties.headers.token === "string"
      ? RequestProperties.headers.token
      : false;
  if (phone) {
    //verify token
    tokenhandler._token.verify(tokenId, phone, (result) => {
      if (result) {
        //if phone property is present in RequestProperties then read from filebase
        data.read("users", phone, (err, result) => {
          let userObj = { ...utils.parseJSON(result) };
          if (!err && result) {
            //if found then show the data to user
            //delete the password before showing
            delete userObj.password;
            callback(200, userObj);
          } else {
            //if not found throw error to user
            callback(400, { message: "No record found with this number" });
          }
        });
      } else {
        callback(403, { message: "Authorization Failed!" });
      }
    });
  } else {
    //if there is no phone property in RequestProperties then give invalid error
    callback(400, { message: "invalid" });
  }
};

//for Put operations
handler._users.put = (RequestProperties, callback) => {
  //checking of all the field
  const firstName =
    typeof RequestProperties.body.firstName === "string" &&
    RequestProperties.body.firstName.trim().length > 0 &&
    RequestProperties.body.firstName.trim().length < 20
      ? RequestProperties.body.firstName
      : false;

  const lastName =
    typeof RequestProperties.body.lastName === "string" &&
    RequestProperties.body.lastName.trim().length > 0 &&
    RequestProperties.body.lastName.trim().length < 20
      ? RequestProperties.body.lastName
      : false;
  const phone =
    typeof RequestProperties.body.phone === "number" &&
    JSON.stringify(RequestProperties.body.phone).length === 12
      ? RequestProperties.body.phone
      : false;

  const password =
    typeof RequestProperties.body.password === "string" &&
    RequestProperties.body.password.trim().length > 0 &&
    RequestProperties.body.password.trim().length < 30
      ? RequestProperties.body.password
      : false;
  const tokenId =
    typeof RequestProperties.headers.token === "string"
      ? RequestProperties.headers.token
      : false;

  //check if the phone is valid
  if (phone) {
    //check if the updation fields are accurate
    if (firstName || lastName || password) {
      //verify token
      tokenhandler._token.verify(tokenId, phone, (result) => {
        if (result) {
          //read data
          data.read("users", phone, (err, result) => {
            if (!err && result) {
              //update fields
              let userObj = utils.parseJSON(result);
              if (firstName) userObj.firstName = firstName;
              if (lastName) userObj.lastName = lastName;
              if (password) userObj.password = utils.hash(password);

              data.update("users", phone, userObj, (err) => {
                if (!err) {
                  delete userObj.password;
                  callback(200, {
                    message: "User Updated successfully",
                    userObj,
                  });
                } else {
                  callback(500, {
                    message: "Error!Please try after some time",
                  });
                }
              });
            } else {
              callback(400, { message: "No Record found with phone" });
            }
          });
        } else {
          callback(403, { message: "Auth unsuccessful" });
        }
      });
    } else {
      callback(400, { message: "Invalid Request,Please Check" });
    }
  } else {
    callback(400, { message: "Invalid Request,Please Check" });
  }
};

//for Delete operations
handler._users.delete = (RequestProperties, callback) => {
  //deleting user data using phone number
  const phone = RequestProperties.query.phone;
  const tokenId =
    typeof RequestProperties.headers.token === "string"
      ? RequestProperties.headers.token
      : false;
  if (phone) {
    //verify token
    tokenhandler._token.verify(tokenId, phone, (result) => {
      if (result) {
        //if phone property is present in RequestProperties then read from filebase
        data.read("users", phone, (err) => {
          if (!err) {
            //if found then delete the user
            data.delete("users", phone, (res) => {
              callback(200, { message: res });
            });
          } else {
            //if not found throw error to user
            callback(400, { message: "No record found with this number" });
          }
        });
      } else {
        callback(403, { message: "Auth unsuccessful!" });
      }
    });
  } else {
    //if there is no phone property in RequestProperties then give invalid error
    callback(400, { message: "invalid" });
  }
};

module.exports = handler;
