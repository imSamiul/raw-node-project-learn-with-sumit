const fs = require('fs');
const path = require('path');

const lib = {};

// base directory of the data folder
lib.basedir = path.join(__dirname, '/../.data/');

// write data to file
lib.create = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      fs.writeFile(fileDescriptor, stringData, (err1) => {
        if (!err1) {
          fs.close(fileDescriptor, (err2) => {
            if (!err2) {
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('There was an error, file may already exists');
    }
  });
};

// read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
    callback(err, data);
  });
};

// update existing file
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);

      fs.ftruncate(fileDescriptor, (err1) => {
        if (!err1) {
          fs.writeFile(fileDescriptor, stringData, (err2) => {
            if (!err2) {
              fs.close(fileDescriptor, (err3) => {
                if (!err3) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              });
            } else {
              callback('Error writing to existing file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('There was an error, file may not exist yet');
    }
  });
};

// delete existing file
lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// list all the item in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      const trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback('Error reading directory!');
    }
  });
};
module.exports = lib;
