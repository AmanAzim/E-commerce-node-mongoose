const path = require('path');

//This will give the directory name of the root of this application
module.exports = path.dirname(process.mainModule.filename);//Returns directory name of a path
                            //this gives the path of the file which is responsible of running this application