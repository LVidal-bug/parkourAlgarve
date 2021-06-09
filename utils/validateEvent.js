const alphabetArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
const ExpressError = require('../utils/ExpressError');

module.exports.validateEvent = (req, res, next) => {
    let isEmpty = false
    for (let i = 0; i < req.body.name.length; i++) {
        if (!alphabetArray.includes(req.body.name[i])) {
            isEmpty = true
        }
        else {
            isEmpty = false;
            break
        }
    }
    let isEmptyDes = false
    for (let i = 0; i < req.body.description.length; i++) {
        if (!alphabetArray.includes(req.body.description[i])) {
            isEmptyDes = true
        }
        else {
            isEmptyDes = false;
            break
        }
    }
    if (isEmptyDes) return req.body.description = null
    if (isEmpty) {
        next(new ExpressError('Campo do nome estava vazio!', 500))
    }
    if (req.body.freeSpaces > 300) return next(new ExpressError('Evento não pode ter mais que 300 vagas!', 500))

    next()
}