const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/wrapAsync.js')
const passport = require('passport');
const User = require('../models/user.js')
const multer = require('multer')
const { storage, cloudinary } = require('../cloudinary');
const upload = multer({ storage });
const ExpressError = require('../utils/ExpressError');
const { isValidated, hasTitle, isLoggedIn, isInstructor, isUser } = require('../middleware.js')
const File = require("../models/files.js");
const deleteFile = require('../childprocess.js')
const { v4: uuidv4 } = require('uuid');
let jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer')
const { sendConfirmationEmail, verifyUser, sendRecoverPasswordEmail } = require('../confirmationEmail.js')
const array = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'Y', 'X', 'Z']



const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public");
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split("/")[1];
        cb(null, `files/admin-${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new ExpressError("Not a PDF File!!"), false);
    }
}


const uploadPDF = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
})

router.route('/register')
    .get((req, res) => {
        res.render('user/register')
    })
    .post(catchAsync(async (req, res, next) => {
        try {
            const { username, email, password } = req.body;
            if (password.length < 8) {
                req.flash('error', 'Palavra-passe inválida. Mínimo 8 caracteres')
                res.redirect('/register')
            }
            let isvalid = false
            for (let letter of array) {
                if (password.includes(letter)) {
                    isvalid = true
                }
            }
            if (!isvalid) {
                req.flash('error', 'Palavra-passe inválida. Mínimo uma letra maiúscula')
                res.redirect('/register')
            }
            else {
                const token = jwt.sign({ email }, process.env.TOKEN_SECRET)
                const user = await new User({ username, email })
                user.profile = {}
                user.confirmationCode = token
                const registeredUser = await User.register(user, password)
                req.flash('success', ' Registrado com sucesso! Por favor confirme o seu email.')
                res.redirect('/sobreNos')
                console.log(token)
                sendConfirmationEmail(
                    user.username,
                    user.email,
                    user.confirmationCode
                )

            }
        } catch (e) {
            req.flash('error', e.message)
            return res.redirect('/register')
        }
    }))

router.get('/confirm/:confirmationCode', verifyUser, catchAsync(async (req, res) => {
    const { confirmationCode } = req.params
    const user = await User.findOne({ confirmationCode })
    req.login(user, err => {
        if (err) return next(err)
        req.flash('success', 'Conectado com sucesso!')
        res.redirect('/sobreNos')
    })
}))

router.route('/login')


    .get((req, res) => {
        return res.render('user/login')
    })
    .post(isValidated, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        function (req, res) {
            res.redirect('/sobreNos');
        });


router.get('/logout', catchAsync(async (req, res) => {
    req.logout();
    return res.redirect('/sobreNos')
}))


router.get('/user/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id).populate('certificates')
    return res.render('user/account', { user })
}))

router.get('/user/:id/editProfile', isLoggedIn, isUser, catchAsync(async (req, res) => {
    const { id } = req.params
    const user = await User.findById(id).populate('certificates')
    res.render('user/editarPerfil', { user })
}))

router.put('/user/:id/editProfile', isLoggedIn, isUser, upload.single('image'), catchAsync(async (req, res) => {
    try {
        const { id } = req.params;
        const { age, description, city, experience } = req.body
        const photoUser = await User.findById(id)
        const img = photoUser.profile.photo.url
        const imgFile = photoUser.profile.photo.fileName
        const profile = { age, description, city, experience }
        const foundUser = await User.findByIdAndUpdate(id, { profile }, { new: true })
        if (req.file) {
            foundUser.profile.photo = {
                url: req.file.path, fileName: req.file.filename
            }
        }
        if (!req.file) {
            foundUser.profile.photo.url = img
        }
        await foundUser.save()
        if (img !== foundUser.profile.photo.url && img) {
            await cloudinary.uploader.destroy(imgFile)
        }
        return res.redirect(`/user/${id}`)
    } catch (e) {
        console.log(e)
        return await cloudinary.uploader.destroy(imgFile)
    }
}))

router.post('/user/:id/addCertificate', isLoggedIn, isUser, uploadPDF.single('uploadPDF'), catchAsync(async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        const userID = user._id
        const name = req.body.title
        let certificates = []
        if (!req.file) {
            req.flash('error', 'Adicione um ficheiro!')
            return res.redirect(`/user/${id}`)
        }
        if (req.file.length !== 0) {
            const newFile = await new File({
                name: req.file.filename,
                createdAt: Date.now(),
                author: userID,
                title: name
            })
            if (!req.body.title) {
                req.flash('error', 'Certificado inválido! Ficheiro precisa ser nomeado')
                deleteFile(`${newFile.name}`)
                res.redirect(`/user/${id}`)
            }
            await newFile.save()
            const Certificatefile = await File.findById(newFile._id)
            user.certificates.push(Certificatefile._id)
            await user.save()
            return res.redirect(`/user/${id}`)
        }
    } catch (error) {
        return next(new ExpressError(error, 400))
    }
}))

router.get('/user/:id/certificates/:certificateID', isLoggedIn, catchAsync(async (req, res) => {
    const { id, certificateID } = req.params
    const user = await User.findById(id)
    const file = await File.findById(certificateID)
    return res.render('user/pdfFile', { file, user })
}))

router.delete('/user/:id/certificates/:certificateID', isLoggedIn, isUser, catchAsync(async (req, res) => {
    const { certificateID, id } = req.params
    const user = await User.findById(id);
    console.log(certificateID)
    await user.updateOne({ $pull: { certificates: certificateID } })
    console.log(user)
    const deletedFile = await File.findByIdAndDelete(certificateID)

    deleteFile(`${deletedFile.name}`)
    res.redirect(`/user/${id}`)
}))

router.get('/api/getFiles', catchAsync(async (req, res, next) => {
    try {
        const files = await File.find();
        return res.status(200).json({
            status: "success",
            files,
        });
    } catch (error) {
        res.json({
            status: "Fail",
        })
        return next(new ExpressError(error, 400))
    }
}))

router.get('/recoverPassword', (req, res) => {
    res.render('password/recoverPassword')
})

router.post('/recoverPassword', catchAsync(async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        const token = uuidv4()
        user.recoverPassword = token
        await user.save()
        sendRecoverPasswordEmail(email, token, user)
        req.flash('success', 'Email enviado!')
        res.redirect('/recoverPassword')
    } catch (e) {
        res.redirect('/recoverPassword')
        console.log(e)
    }

}))

router.get('/replacePassword/:id/:token', catchAsync(async (req, res, next) => {
    const { token, id } = req.params
    const user = await User.findById(id)
    if (user.recoverPassword === token) {
        res.render('password/replacePassword', { token, user })
    }
    next(new ExpressError('Página não encontrada', 404))
}))

router.post('/replacePassword/:id/:token', catchAsync(async (req, res, next) => {
    const { token, id } = req.params
    const user = await User.findById(id)
    if (user.googleId) {
        req.flash('error', 'O Usuário associado ao email referido está conectado via Google')
        res.redirect('/login')
    }
    if (user.recoverPassword === token) {
        const { newPassword, newPassword2 } = req.body
        if (newPassword === newPassword2) {
            if (newPassword.length < 8) {
                req.flash('error', 'Palavra-passe inválida! Mínimo 8 caracteres')
                res.redirect(`/replacePassword/${id}/${token}`)
            }
            let isvalid = false
            for (let letter of array) {
                if (newPassword.includes(letter)) {
                    isvalid = true
                }
            }
            if (!isvalid) {
                req.flash('error', 'Palavra-passe inválida! Mínimo uma letra maiúscula')
                res.redirect(`/replacePassword/${id}/${token}`)
            }
            else {
                await user.setPassword(newPassword)
                user.recoverPassword = null
                await user.save()
                req.flash('success', 'Palavra-passe redefinida com sucesso')
                res.redirect('/login')
            }
        }
        req.flash('error', 'As palavras passe não são iguais!')
        res.redirect(`/replacePassword/${user._id}/${token}`)
    }
    next(new ExpressError('Página não encontrada', 404))
}))

router.get('/usernames/API', catchAsync(async (req, res) => {
    const users = await User.find({})
    let usernames = []
    for (let user of users) {
        usernames.push(user.username)
    }
    res.status(200).json({
        usernames: usernames
    })
}))
router.get('/emails/API', catchAsync(async (req, res) => {
    const users = await User.find({})
    let emails = []
    for (let user of users) {
        emails.push(user.email)
    }
    res.status(200).json({
        emails: emails
    })
}))

module.exports = router