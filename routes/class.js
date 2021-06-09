const express = require('express')
const router = express.Router();
const deleteFile = require('../childprocess.js')
const Class = require('../models/aulas.js')
const User = require('../models/user.js')
const wrapAsync = require('../utils/wrapAsync.js')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const { validateClass, isLoggedIn, isInstructor, isOwner } = require('../middleware.js')
const fileUpload = require('express-fileupload');
const ExpressError = require('../utils/ExpressError.js');
const { validateClassDATA } = require('../utils/validateClass.js')
//router.use(fileUpload())

router.get('/classes', wrapAsync(async (req, res) => {
    const aulas = await Class.find({}).populate('instructor')
    console.log(aulas)
    res.render('aulas/aulas', { aulas })
}))

router.get('/addNew/class', isLoggedIn, isInstructor, (req, res) => {
    res.render('aulas/novaAula')

})

router.post('/addNew/class', isLoggedIn, isInstructor, upload.array('image'), validateClass, validateClassDATA, wrapAsync(async (req, res, next) => {
    try {
        const aula = await new Class(req.body)
        console.log(req.file)
        if (!req.files.length) {
            req.flash('error', 'É obrigatório adicionar pelo menos uma imagem')
            return res.redirect('/addNew/class')
        }

        if (req.files.length > 15) {
            req.flash('error', 'Máximo 15 imagens')
            return res.redirect('/addNew/class')
        }
        aula.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
        aula.video = req.file
        aula.instructor = req.user._id
        await aula.save()
        res.redirect('/classes')

    } catch (e) {
        for (let file of req.files) {
            await cloudinary.uploader.destroy(file.filename)
        }
    }

}))

router.get('/class/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const aula = await Class.findById(id).populate('instructor')
    const user = await User.findById(aula.instructor._id).populate('certificates')
    if (aula.images.length) {
        const img = aula.images[0].url
        res.render('aulas/showPage', { aula, img, user })
    }
    res.render('aulas/showPage', { aula, user })
}))

router.get('/class/:id/edit', isLoggedIn, isInstructor, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params
    const aula = await Class.findById(id)
    res.render('aulas/editClass', { aula })
}))

router.put('/class/:id', isLoggedIn, isInstructor, isOwner, upload.array('image'), wrapAsync(async (req, res) => {
    try {
        const { title, description, location } = req.body;
        const { id } = req.params
        const aula2 = await Class.findById(id)
        const aula = await Class.findByIdAndUpdate(id, { title, description, location })
        const { imageToBeDeleted } = req.body


        if (imageToBeDeleted) {
            if (imageToBeDeleted.length > 15) {
                let imageToBeDeletedArray = []
                imageToBeDeletedArray.push(imageToBeDeleted)
                if (!req.files.length && imageToBeDeletedArray.length === aula.images.length) {
                    req.flash('error', 'A sua aula precisa no mínimo de uma imagem')
                    return res.redirect(`/class/${id}/edit`)
                }
                await cloudinary.uploader.destroy(imageToBeDeleted)
                await aula.updateOne({ $pull: { images: { filename: { $in: imageToBeDeleted } } } })
            }

            if (imageToBeDeleted.length > 1) {
                if (!req.files.length && imageToBeDeleted.length === aula.images.length) {
                    req.flash('error', 'A sua aula precisa no mínimo de uma imagem')
                    return res.redirect(`/class/${id}/edit`)
                }
                else {
                    for (let img of imageToBeDeleted) {
                        await cloudinary.uploader.destroy(img)
                        await aula.updateOne({ $pull: { images: { filename: { $in: img } } } })
                    }

                }
            }
        }
        if (aula.images.length === 15) {
            if (req.files) {
                for (let imgFile of req.files) {
                    await cloudinary.uploader.destroy(imgFile.filename)
                }
            }
            req.flash('error', 'Não pode dar upload a mais de 15 imagens')
            res.redirect(`/class/${id}/edit`)
        }
        if (aula.images.length + req.files.length > 15) {
            for (let imgFile of req.files) {
                await cloudinary.uploader.destroy(imgFile.filename)
            }
            req.flash(`error', 'Não pode dar upload a mais de 15 imagens. Pode dar upload no máximo a mais ${15 - aula.images.length + req.files.length} imagens.`)
            res.redirect(`/class/${id}/edit`)

        }
        if (req.files) {
            const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
            aula.images.push(...images)
            await aula.save()
            req.flash('success', 'Aula modificada com sucesso')
            return res.redirect(`/class/${id}`)
        }

    } catch (e) {
        for (let file of req.files) {
            await cloudinary.uploader.destroy(file.filename)
        }
    }


}))

router.delete('/class/:id', isLoggedIn, isInstructor, isOwner, wrapAsync(async (req, res) => {
    try {
        const { id } = req.params
        const aula = await Class.findByIdAndDelete(id)
        for (let img of aula.images) {
            await cloudinary.uploader.destroy(img.filename)
        }
        cloudinary.api.delete_resources([aula.video.filename],
            { resource_type: 'video' },
            function (error, result) { console.log(result, error); });
        req.flash('success', 'Aula Apagada')
        return res.redirect('/classes')
    } catch (e) {
        cloudinary.api.delete_resources([aula.video.filename],
            { resource_type: 'video' },
            function (error, result) { console.log(result, error); });
        console.log(e)
    }
}))

router.get('/class/:id/addVideo/:userId', isLoggedIn, isInstructor, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params
    const aula = await Class.findById(id)
    res.render('aulas/addVideo', { aula })
}))



const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `videos/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "mp4") {
        cb(null, true);
    } else {
        cb(new ExpressError("Not a mp4 File!!"), false);
    }
}


const uploadVideo = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

router.post('/addVideo/:aulaId/:id', uploadVideo.single('video'), wrapAsync(async (req, res) => {

    const { id, aulaId } = req.params
    const aula = await Class.findById(aulaId)
    if (aula.video || aula.video.filename) {
        cloudinary.api.delete_resources([aula.video.filename],
            { resource_type: 'video' },
            function (error, result) { console.log(result, error); });
    }
    await cloudinary.uploader.upload_large(req.file.path,
        {
            folder: '/Parkour Algarve',
            resource_type: "video",
            chunk_size: 6000000
        },
        async function (error, result) {
            try {
                const { id, aulaId } = req.params
                const aula = await Class.findById(aulaId)
                aula.video.path = result.secure_url
                aula.video.filename = result.public_id
                deleteFile(`${req.file.filename}`)
                await aula.save()
                req.flash('success', 'O seu video foi adicionado!')
                return res.redirect(`/class/${aulaId}`)
            } catch (e) {
                deleteFile(`${req.file.filename}`)
                console.log(result)
                cloudinary.api.delete_resources([result.public_id],
                    { resource_type: 'video' },
                    function (error, result) { console.log(result, error); });
                req.flash('error', 'Algo foi errado tente denovo.')
                return res.redirect(`/class/${aulaId}`)
            }
        });
}))



module.exports = router