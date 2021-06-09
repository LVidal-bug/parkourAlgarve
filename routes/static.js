const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home')
    console.log(Date.now())


})

router.get('/sobreNos', (req, res) => {
    res.render('sobreNos')
})

router.get('/sobreNos/saibamais', (req, res) => {
    res.render('sobreNosSaibamais')
})
router.get('/agenda', (req, res) => {
    res.render('agenda')
})

router.get('/parkour', (req, res) => {
    res.render('parkour')
})
module.exports = router