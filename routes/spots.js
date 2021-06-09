const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/wrapAsync.js')
const User = require('../models/user.js')
const Spot = require('../models/spots.js')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const { isValidated, hasTitle, isLoggedIn, isInstructor, isUser, isAdmin, validateSpot } = require('../middleware.js')
const { validateSpotDATA, validateEditSpotDATA } = require('../utils/validateSpot.js')


let coords = []
function coordinatesParser(link) {
    const coordsBETA = link.slice(28)
    const Zcoords = coordsBETA.slice(-4)
    const coordinates = coordsBETA.replace(Zcoords, '')
    const c1 = coordinates.replace(',', ' ')
    let wheretoSub = undefined
    for (let i = 0; i < c1.length; i++) {
        if (c1[i] === ' ') {
            wheretoSub = i
        }
    }
    if (wheretoSub) {
        const lat = c1.substring(0, wheretoSub)
        const long = c1.substring(wheretoSub + 1, c1.length)
        const latitude = Number(lat)
        const longitude = Number(long)
        return coords.push(longitude, latitude)

    }
}





router.get('/allSpots', catchAsync(async (req, res) => {
    res.render('spots/allSpots', { url: req.url })
}))

router.get('/allSpots/admin', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const spots = await Spot.find({ confirmed: 'Pending' })
    res.render('spots/allSpotsAdmin', { spots })

}))



router.get('/addNew/spot', isLoggedIn, catchAsync(async (req, res) => {
    res.render('spots/newSpot')
}))

router.post('/addNew/spot', upload.array('image', 5), isLoggedIn, validateSpot, validateSpotDATA, catchAsync(async (req, res, next) => {
    try {
        if (!req.files.length) {
            req.flash('error', `Spot deverá conter no mínimo uma imagem! `)
            return res.redirect('/addNew/spot')
        }
        const { title, description, location, city } = req.body
        const newSpot = await new Spot({ location, owner: req.user._id, description, city })
        newSpot.title = title.trim()
        newSpot.description = newSpot.description.trim()
        newSpot.images = req.files.map(i => ({ url: i.path, filename: i.filename }))
        let query = newSpot.title.toLowerCase()
        query = newSpot.title.toLowerCase()
        for (let q of query) {
            if (q === ' ') {
                query = query.replace(q, '')
            }
        }
        newSpot.titleQuery = query
        await newSpot.save()
        console.log('nice')
        req.flash('success', 'O seu spot foi submetido para admissão de um admin')
        return res.redirect('/allSpots')
    } catch (e) {
        for (let img of req.files) {
            await cloudinary.uploader.destroy(img.filename)
        }
        console.log(e)
        req.flash('error', 'Ocorreu um erro! Tente novamente.')
        return res.redirect('/allSpots')
    }
}))

router.get('/spot/:spotId', catchAsync(async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findById(spotId)
    res.render('spots/showpage', { spot })
}))
router.get('/editSpot/:spotId', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { spotId } = req.params;
    const spot = await Spot.findById(spotId)
    res.render('spots/editSpot', { spot })
}))

router.put('/spot/:spotId', upload.array('image', 5), validateSpot, validateEditSpotDATA, catchAsync(async (req, res) => {
    try {
        const { spotId } = req.params;
        const { title, description, city, location } = req.body
        if (!req.body.location.substring(0, 28).includes('https://www.google.pt/maps/@')) {
            req.flash('error', `O link que forneceu precisa de ser retirado do google maps. Link deverá começar por: "https://www.google.pt/maps/@" + coordenadas do spot `)
            return res.redirect('/addNew/spot')
        }
        coordinatesParser(spot.location)
        spot.geometry.coordinates = coords
        const spot = await Spot.findByIdAndUpdate(spotId, { title, description, location, city })
        spot.description = spot.description.trim()
        spot.description = spot.description.trimEnd()
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        spot.images.push(...imgs)
        const { imageToBeDeleted } = req.body
        if (imageToBeDeleted) {
            if (imageToBeDeleted.length > 15) {
                let imageToBeDeletedArray = []
                imageToBeDeletedArray.push(imageToBeDeleted)
                if (!req.files.length && imageToBeDeletedArray.length === spot.images.length) {
                    req.flash('error', 'O spot precisa no mínimo de uma imagem')
                    return res.redirect(`/editSpot/${spotId}`)
                }
                await cloudinary.uploader.destroy(imageToBeDeleted)
                await spot.updateOne({ $pull: { images: { filename: { $in: imageToBeDeleted } } } })
            }

            if (imageToBeDeleted.length > 1) {
                if (!req.files.length && imageToBeDeleted.length === spot.images.length) {
                    req.flash('error', 'O spot precisa no mínimo de uma imagem')
                    return res.redirect(`/editSpot/${spotId}`)
                }
                else {
                    for (let img of imageToBeDeleted) {
                        await cloudinary.uploader.destroy(img)
                        await spot.updateOne({ $pull: { images: { filename: { $in: img } } } })
                    }

                }
            }
        }
        if (spot.images.length > 5) {
            for (let img of req.files) {
                await cloudinary.uploader.destroy(img.filename)
            }
            req.flash('error', 'O spot não pode ter mais do que 5 imagens associadas')
            return res.redirect(`/spot/${spotId}`)
        }
        await spot.save()
        req.flash('success', 'Spot atualizado com sucesso')
        return res.redirect(`/spot/${spotId}`)

    } catch (e) {
        for (let img of req.files) {
            await cloudinary.uploader.destroy(img.filename)
        }
        console.log(e)
        req.flash('error', 'Ocorreu um erro! Tente novamente.')
        return res.redirect(`/spot/${spotId}`)
    }
}))

router.post('/spot/:spotId/accept', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { spotId } = req.params
    const spot = await Spot.findById(spotId)
    spot.confirmed = 'Confirmed'
    coordinatesParser(spot.location)
    spot.geometry.coordinates = coords
    await spot.save()
    res.redirect('/allSpots/admin')
}))



router.delete('/spot/:spotId', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { spotId } = req.params
    const spot = await Spot.findByIdAndDelete(spotId)
    for (let img of spot.images) {
        await cloudinary.uploader.destroy(img.filename)
    }
    req.flash('success', 'Spot deletado com sucesso')
    return res.redirect('/allSpots/admin')
}))

router.delete('/spot/:spotId/deny', isLoggedIn, isAdmin, catchAsync(async (req, res) => {
    const { spotId } = req.params
    const spot = await Spot.findByIdAndDelete(spotId)
    for (let img of spot.images) {
        await cloudinary.uploader.destroy(img.filename)
    }
    req.flash('success', 'Spot deletado com sucesso')
    return res.redirect('/allSpots/admin')
}))

router.get('/allSpots/API', async (req, res) => {
    const spots = await Spot.find({ confirmed: 'Confirmed' })
    let array = []
    let array1 = []
    for (let s of spots) {
        let obj = {
            geometry: s.geometry,
            properties: {
                description: s.description,
                id: s._id,
                title: s.title,
                imageURL: s.images[0].url,
                city: s.city,
                query: s.titleQuery
            }
        }
        array.push(obj)
    }
    return res.status(200).json({
        features: array
    });
})

router.get('/allSpots/API/MAP', catchAsync(async (req, res) => {
    if (!req.query.city && !req.query.searchInput) {
        const spots = await Spot.find({ confirmed: 'Confirmed' })
        let array = []
        let array1 = []
        for (let s of spots) {
            let obj = {
                geometry: s.geometry,
                properties: {
                    id: s._id,
                    title: s.title,
                    imageURL: s.images[0].url
                }
            }
            array.push(obj)
        }
        return res.status(200).json({
            features: array
        });

    }
    if (req.query.city && req.query.searchInput) {
        const { searchInput, city } = req.query
        console.log(city)
        let query = searchInput.toLowerCase()
        for (let q of query) {
            if (q === ' ') {
                query = query.replace(q, '')
            }
        }
        if (city === '1') {
            const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed' })
            console.log(spots)
            let array = []
            let array1 = []
            for (let s of spots) {
                let obj = {
                    geometry: s.geometry,
                    properties: {
                        id: s._id,
                        title: s.title,
                        imageURL: s.images[0].url
                    }
                }
                array.push(obj)
            }
            return res.status(200).json({
                features: array
            });
        }
        if (city !== '1') {
            const spots = await Spot.find({ titleQuery: query, confirmed: 'Confirmed', city })
            let array = []
            let array1 = []
            for (let s of spots) {
                let obj = {
                    geometry: s.geometry,
                    properties: {
                        id: s._id,
                        title: s.title,
                        imageURL: s.images[0].url
                    }
                }
                array.push(obj)
            }
            return res.status(200).json({
                features: array
            });
        }
    }

    if (!req.query.searchInput && req.query.city) {
        const { city } = req.query
        if (city === 'Todos') {


            const spots = await Spot.find({ confirmed: 'Confirmed' })
            let array = []
            let array1 = []
            for (let s of spots) {
                let obj = {
                    geometry: s.geometry,
                    properties: {
                        id: s._id,
                        title: s.title,
                        imageURL: s.images[0].url
                    }
                }
                array.push(obj)
            }
            return res.status(200).json({
                features: array
            });
        }
        const spots = await Spot.find({ confirmed: 'Confirmed', city })

        let array = []
        let array1 = []
        for (let s of spots) {
            let obj = {
                geometry: s.geometry,
                properties: {
                    id: s._id,
                    title: s.title,
                    imageURL: s.images[0].url
                }
            }
            array.push(obj)
        }
        return res.status(200).json({
            features: array
        });
    }
}))

module.exports = router
