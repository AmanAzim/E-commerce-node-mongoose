const fs = require('fs');

const deleteFile = filePath => {

    fs.unLink(filePath, (err) => {
        if (err) {
            throw (err);
        }
    });
};

exports.deleteFile = deleteFile;