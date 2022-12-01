/* 
  Title : data handling library
  Description : File for all data operations
  Author : Aritra Pal
  Date : 16/11/2022 
*/

//dependencies
const fs = require("fs");
const path = require("path");

//module scaffolding
const lib = {};

//getting the path of data folder
lib.baseDir = path.join(__dirname, "../.data/");

//function for creating file and write
lib.create = function (dir, filename, data, callback) {
  //open file for writing
  fs.open(
    path.join(lib.baseDir, dir, filename + ".json"),
    "wx",
    (openerr, filedescriptor) => {
      // if error provide error in the main function callback else writefile
      if (!openerr && filedescriptor) {
        //convert the data to string so that we can write in json file
        const dataString = JSON.stringify(data);

        //writing in file , we provide file descriptor so that it can refer the file to write
        fs.writeFile(filedescriptor, dataString, (writeerr) => {
          if (!writeerr) {
            //writing is successfull can close the file
            fs.close(filedescriptor, (closeerr) => {
              if (!closeerr) {
                //closing the file is successful so provide false in callback
                callback(false);
              } else {
                //closing file is unsuccessful provide error in callback
                callback("Cant close the File!");
              }
            });
          } else {
            //writing is unsuccessfull provide error to the callback
            callback("Cant write the file!");
          }
        });
      } else {
        callback(
          "Cant create new file, file may already exist!" +
            JSON.stringify(openerr)
        );
        console.log("cant create new file,file already exist");
      }
    }
  );
};

//function for reading from file
lib.read = function (dir, filename, callback) {
  //read file
  fs.readFile(
    path.join(lib.baseDir, dir, filename + ".json"),
    "utf-8",
    (err, data) => {
      callback(err, data);
    }
  );
};

//function for upodating the data
lib.update = function (dir, filename, data, callback) {
  //opening the file
  fs.open(
    path.join(lib.baseDir, dir, filename + ".json"),
    "r+",
    (openerr, filedescriptor) => {
      if (!openerr) {
        //not error then truncate the file and then write
        fs.ftruncate(filedescriptor, (truncerr) => {
          if (!truncerr) {
            //Converting updation data
            const stringData = JSON.stringify(data);
            //truncation successfull then write the updation data
            fs.writeFile(filedescriptor, stringData, (writeerr) => {
              if (!writeerr) {
                //Close the file
                fs.close(filedescriptor, (closeerr) => {
                  if (!closeerr) {
                    //all operations done
                    callback(false);
                  } else {
                    // error closing the file
                    callback("Error closing the file");
                  }
                });
              } else {
                // write error
                callback("Error writing the file!");
              }
            });
          } else {
            //truncation error occured
            callback("Error truncating the file");
          }
        });
      } else {
        //open error occurs
        callback("Error Opening the file");
      }
    }
  );
};

//function to delete the file
lib.delete = function (dir, filename, callback) {
  //unlink the file
  fs.unlink(path.join(lib.baseDir, dir, filename + ".json"), (deleteerr) => {
    if (!deleteerr) {
      //successfully delete
      callback("Deleted successfully");
    } else {
      //error in deleting
      callback("Error in deleting file!" + JSON.stringify(deleteerr));
    }
  });
};

//function to list all the files in a directory
lib.list = function (dir, callback) {
  //read all the files
  fs.readdir(path.join(lib.baseDir, dir + "/"), (err, fileName) => {
    if (!err && fileName && fileName.length > 0) {
      //store the trimmed file names
      let trimmedFileNames = [];
      //loop through the result
      fileName.forEach((item) => {
        trimmedFileNames.push(item.replace(".json", ""));
      });
      callback(false, trimmedFileNames);
    } else {
      callback("Cant read filename from the directory!");
    }
  });
};

//exporting module
module.exports = lib;
