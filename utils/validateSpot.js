const ExpressError = require('../utils/ExpressError');
const Spot = require('../models/spots.js')
const alphabetArray = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
let cityArray = ['Faro', 'Portimão', 'Lagos', 'Lagoa', 'Albufeira', 'Aljezur', 'Monchique', 'Silves', 'Loulé', 'São Brás', 'Olhão', 'Tavira', 'Alcoutim', 'Castro Marim', 'Vila Real de Santo António']

module.exports.validateSpotDATA = async (req, res, next) => {
    let isEmptyDes = false
    let isEmpty = false
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
    if (isEmpty || isEmptyDes) {
        next(new ExpressError('Alguns campos estavam vazios!', 500))
    }

    req.body.title = req.body.title.trim()
    const spots = await Spot.find({})
    for (let s of spots) {
        let confirmTitle = req.body.title.toLowerCase()

        for (let i = 0; i < confirmTitle.length; i++) {
            if (confirmTitle[i] === ' ') confirmTitle = confirmTitle.replace(' ', '')
        }
        if (s.titleQuery === confirmTitle) {
            next(new ExpressError('Nome atribuido ao spot já está em uso!', 500))
        }
    }
    if (!cityArray.includes(req.body.city)) {
        next(new ExpressError('Cidade inválida!', 500))
    }

    if (!req.body.location.substring(0, 28).includes('https://www.google.pt/maps/@')) {
        req.flash('error', `O link que forneceu precisa de ser retirado do google maps. Link deverá começar por: "https://www.google.pt/maps/@" + coordenadas do spot `)
        return res.redirect('/addNew/spot')
    }
    next()
}

module.exports.validateEditSpotDATA = async (req, res, next) => {
    let isEmptyDes = false
    let isEmpty = false
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
    if (isEmpty || isEmptyDes) {
        next(new ExpressError('Alguns campos estavam vazios!', 500))
    }


    if (!cityArray.includes(req.body.city)) {
        next(new ExpressError('Cidade inválida!', 500))
    }
    next()
}