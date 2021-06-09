const ExpressError = require('../utils/ExpressError');
const Class = require('../models/aulas.js')
const alphabetArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]

module.exports.validateClassDATA = async (req, res, next) => {
    let isEmptyDes = false
    let isEmpty = false
    let isEmptyLoc = false
    for (let i = 0; i < req.body.title.length; i++) {
        if (!alphabetArray.includes(req.body.title[i])) {
            isEmpty = true
        }
        else {
            isEmpty = false;
            break
        }
    }
    for (let i = 0; i < req.body.description.length; i++) {
        if (!alphabetArray.includes(req.body.description[i])) {
            isEmptyDes = true
        }
        else {
            isEmptyDes = false;
            break
        }
    }
    for (let i = 0; i < req.body.location.length; i++) {
        if (!alphabetArray.includes(req.body.location[i])) {
            isEmptyLoc = true
        }
        else {
            isEmptyLoc = false;
            break
        }
    }
    if (isEmpty || isEmptyDes || isEmptyLoc) {
        next(new ExpressError('Alguns campos estavam vazios!', 500))
    }
    next()
}