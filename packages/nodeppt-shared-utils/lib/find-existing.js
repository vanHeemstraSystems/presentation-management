/**
 * @file Find existing files
 */
const fs = require('fs');
const path = require('path');

exports.findExisting = (context, files) => {
    for (const file of files) {
        if (fs.existsSync(path.join(context, file))) {
            return file;
        }
    }
};