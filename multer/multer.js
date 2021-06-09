const multer = require('multer')



const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new ExpressError("Not a PDF File!!"), false);
    }
}

module.exports = multerFilter
module.exports = multerStorage